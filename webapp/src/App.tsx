import React, { useState, useEffect, useOptimistic, startTransition, useCallback, useMemo } from 'react';
import { SiteSelector } from './components/SiteSelector';
import { SpaceTree } from './components/SpaceTree';
import { SelectedCamerasList } from './components/SelectedCameras/SelectedCamerasList';
import { ThemeToggle } from './components/ThemeToggle';

import { ThemeProvider } from './contexts/ThemeContext';
import { useSpaces, addStreamToSpace, deleteStream } from './hooks/useApi';
import { buildTreeFromFlat, getSelectedStreamsInTree } from './utils/treeUtils';
import { TreeNode, Stream, Space, SpacesGroup } from './types/api.types';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import './App.css';

// Define action types for optimistic updates
type OptimisticAction = 
  | { type: 'ADD_STREAM'; spaceId: number; stream: Stream }
  | { type: 'UPDATE_STREAM_ID'; oldId: number; newId: number }
  | { type: 'REMOVE_STREAM'; streamId: number };

// Reducer function for optimistic updates
function optimisticReducer(state: TreeNode[], action: OptimisticAction): TreeNode[] {
  switch (action.type) {
    case 'ADD_STREAM':
      return addStreamToTreeOptimistically(state, action.spaceId, action.stream);
    
    case 'UPDATE_STREAM_ID':
      return updateStreamIdInTree(state, action.oldId, action.newId);
    
    case 'REMOVE_STREAM':
      return removeStreamFromTreeOptimistically(state, action.streamId);
    
    default:
      return state;
  }
}

// Helper functions
const addStreamToTreeOptimistically = (nodes: TreeNode[], spaceId: number, stream: Stream): TreeNode[] => {
  return nodes.map(node => {
    if (node.id === spaceId) {
      return {
        ...node,
        streams: [...node.streams, stream]
      };
    }
    return {
      ...node,
      children: addStreamToTreeOptimistically(node.children, spaceId, stream)
    };
  });
};

const updateStreamIdInTree = (nodes: TreeNode[], oldId: number, newId: number): TreeNode[] => {
  return nodes.map(node => ({
    ...node,
    streams: node.streams.map(stream => 
      stream.id === oldId ? { ...stream, id: newId } : stream
    ),
    children: updateStreamIdInTree(node.children, oldId, newId)
  }));
};

const removeStreamFromTreeOptimistically = (nodes: TreeNode[], streamId: number): TreeNode[] => {
  return nodes.map(node => ({
    ...node,
    streams: node.streams.filter(stream => stream.id !== streamId),
    children: removeStreamFromTreeOptimistically(node.children, streamId)
  }));
};

const replaceStreamInTree = (nodes: TreeNode[], oldId: number, newStream: Stream): TreeNode[] => {
  return nodes.map(node => {
    const updatedStreams = node.streams.map(stream => {
      if (stream.id === oldId) {
        return newStream;
      }
      return stream;
    });
    
    return {
      ...node,
      streams: updatedStreams,
      children: replaceStreamInTree(node.children, oldId, newStream)
    };
  });
};

function AppContent() {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedStreamIds, setSelectedStreamIds] = useState<Set<number>>(new Set());
  const [spacesTree, setSpacesTree] = useState<TreeNode[]>([]);
  
  // Static virtualization configuration - memoized
  const virtualizationConfig = useMemo(() => ({
    enabled: true,
    maxHeight: 400,
    itemHeight: 48,
    threshold: 7 // Enable virtualization when there are 7+ items for optimal performance
  }), []);

  // Use useOptimistic for optimistic updates
  const [optimisticSpacesTree, updateOptimisticTree] = useOptimistic(
    spacesTree,
    optimisticReducer
  );

  const { data: spacesData, loading: spacesLoading, error: spacesError } = useSpaces(selectedSiteId);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Build tree when spaces data changes
  useEffect(() => {
    if (spacesData?.spaces) {
      // Flatten the nested structure
      const flattenedSpaces: Space[] = [];
      spacesData.spaces.forEach((group: SpacesGroup) => {
        if (group.spaces) {
          flattenedSpaces.push(...group.spaces);
        }
      });
      
      const tree = buildTreeFromFlat(flattenedSpaces);
      setSpacesTree(tree);
      // Clear selections when site changes
      setSelectedStreamIds(new Set());
    } else if (spacesError) {
      // Reset to empty state when there's an error
      setSpacesTree([]);
      setSelectedStreamIds(new Set());
    }
  }, [spacesData, spacesError]);

  // Memoized event handlers
  const handleSiteChange = useCallback((siteId: string) => {
    setSelectedSiteId(siteId);
    // Reset spaces and selections when site changes
    setSpacesTree([]);
    setSelectedStreamIds(new Set());
  }, []);

  const handleSelectionChange = useCallback((newSelectedStreamIds: Set<number>) => {
    setSelectedStreamIds(newSelectedStreamIds);
  }, []);

  const handleRemoveStream = useCallback((streamId: number) => {
    const newSelectedIds = new Set(selectedStreamIds);
    newSelectedIds.delete(streamId);
    setSelectedStreamIds(newSelectedIds);
  }, [selectedStreamIds]);

  const handleAddStream = useCallback(async (spaceId: number, streamName: string) => {
    // Generate temporary ID for optimistic update
    const tempId = Date.now();
    const newStream: Stream = {
      id: tempId,
      name: streamName
    };

    // Optimistic update - immediately add to UI
    startTransition(() => {
      updateOptimisticTree({ 
        type: 'ADD_STREAM', 
        spaceId, 
        stream: newStream 
      });
    });

    try {
      // Add 2-second delay for optimistic update
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Make API call
      const response = await addStreamToSpace(spaceId, streamName);
      
      // Show success toast only after API call succeeds
      showSuccess(`Stream "${streamName}" added successfully!`);
      
      // Create the real stream with the API response
      const realStream: Stream = {
        id: response.id,
        name: response.name
      };
      
      // First, add the temp stream to the actual state so we can replace it
      setSpacesTree(currentTree => {
        return addStreamToTreeOptimistically(currentTree, spaceId, newStream);
      });
      
      // Then replace the temp stream with the real one
      setSpacesTree(currentTree => {
        const updatedTree = replaceStreamInTree(currentTree, tempId, realStream);
        return updatedTree;
      });
      
    } catch (error) {
      // On error, revert the optimistic update by removing the temp stream
      console.error('Failed to add stream:', error);
      
      // Remove the optimistically added stream
      startTransition(() => {
        updateOptimisticTree({ 
          type: 'REMOVE_STREAM', 
          streamId: tempId 
        });
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to add stream';
      showError(`Failed to add stream: ${errorMessage}`);
    }
  }, [updateOptimisticTree, showSuccess, showError]);

  const handleDeleteStream = useCallback(async (streamId: number) => {
    // Find stream name for toast message
    const findStreamName = (nodes: TreeNode[]): string | null => {
      for (const node of nodes) {
        const stream = node.streams.find(s => s.id === streamId);
        if (stream) return stream.name;
        const found = findStreamName(node.children);
        if (found) return found;
      }
      return null;
    };
    
    const streamName = findStreamName(optimisticSpacesTree) || 'Stream';

    // Remove from selected streams if selected
    if (selectedStreamIds.has(streamId)) {
      const newSelectedIds = new Set(selectedStreamIds);
      newSelectedIds.delete(streamId);
      setSelectedStreamIds(newSelectedIds);
    }

    // Optimistic update - immediately remove from UI
    startTransition(() => {
      updateOptimisticTree({ 
        type: 'REMOVE_STREAM', 
        streamId 
      });
    });

    try {
      // Add 2-second delay for optimistic update
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Make API call
      await deleteStream(streamId);
      
      // Show success toast only after API call succeeds
      showSuccess(`Stream "${streamName}" deleted successfully!`);
      
      // Update the actual state
      setSpacesTree(currentTree => 
        removeStreamFromTreeOptimistically(currentTree, streamId)
      );
      
    } catch (error) {
      // On error, we need to revert the optimistic update
      // Since we can't easily "add back" the stream, we'll reset to the actual state
      console.error('Failed to delete stream:', error);
      
      // The optimistic state will automatically revert to the actual state
      // because we didn't update the actual state
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete stream';
      showError(`Failed to delete stream: ${errorMessage}`);
    }
  }, [optimisticSpacesTree, selectedStreamIds, updateOptimisticTree, showSuccess, showError]);

  // Use optimistic tree for UI rendering and regular tree for data source
  const selectedStreams = useMemo(() => 
    getSelectedStreamsInTree(optimisticSpacesTree, selectedStreamIds),
    [optimisticSpacesTree, selectedStreamIds]
  );

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">
          Space Navigator
          <span className="app__title-brand">AMBIENT</span>
        </h1>
        <div className="app__header-controls">
          <SiteSelector
            selectedSiteId={selectedSiteId}
            onSiteChange={handleSiteChange}
          />

          <ThemeToggle />
        </div>
      </header>
      
      <main className="app__main">
        <div className="app__sidebar">
          {selectedSiteId && (
            <div className="app__spaces-section">
              {spacesError && (
                <div className="error">Error loading spaces: {spacesError}</div>
              )}
              
              <SpaceTree
                spaces={optimisticSpacesTree} // Use optimistic tree for immediate UI updates
                selectedStreamIds={selectedStreamIds}
                onSelectionChange={handleSelectionChange}
                onAddStream={handleAddStream}
                onDeleteStream={handleDeleteStream}
                isLoading={spacesLoading}
                enableVirtualization={virtualizationConfig.enabled}
                virtualizationConfig={{
                  maxHeight: virtualizationConfig.maxHeight,
                  itemHeight: virtualizationConfig.itemHeight,
                  threshold: virtualizationConfig.threshold
                }}
              />
            </div>
          )}
        </div>
        
        <div className="app__content">
          <SelectedCamerasList
            selectedStreams={selectedStreams}
            onRemoveStream={handleRemoveStream}
          />
        </div>
      </main>
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;