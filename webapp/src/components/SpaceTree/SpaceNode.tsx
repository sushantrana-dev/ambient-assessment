import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { TreeNode, CheckboxState } from '../../types/api.types';
import { StreamItem } from './StreamItem';
import { VirtualizedChildren } from '../VirtualisedComps/VirtualizedChildren';
import { calculateSpaceCheckboxState, getLevelPadding } from '../../utils/treeUtils';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleExpandedNode, addStreamOptimistically, removeStreamOptimistically, replaceStreamOptimistically } from '../../store/slices/spacesSlice';
import { selectAllStreamsInSpace, deselectAllStreamsInSpace } from '../../store/slices/selectionSlice';
import { addStream } from '../../store/slices/spacesSlice';
import { addToast } from '../../store/slices/toastSlice';

interface SpaceNodeProps {
  node: TreeNode;
  level: number;
  enableVirtualization?: boolean;
  virtualizationConfig?: {
    maxHeight?: number;
    itemHeight?: number;
    threshold?: number;
  };
}

export const SpaceNode: React.FC<SpaceNodeProps> = ({
  node,
  level,
  enableVirtualization = true,
  virtualizationConfig = {}
}) => {
  const dispatch = useAppDispatch();
  const [isAddingStream, setIsAddingStream] = useState(false);
  const [newStreamName, setNewStreamName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Redux state selectors
  const selectedStreamIds = useAppSelector(state => state.selection.selectedStreamIds);
  const spaces = useAppSelector(state => state.spaces.optimisticSpaces);
  
  // Memoize expensive calculations
  const checkboxState = useMemo(() => 
    calculateSpaceCheckboxState(node, selectedStreamIds), 
    [node, selectedStreamIds]
  );
  
  const hasChildren = useMemo(() => 
    node.children.length > 0 || node.streams.length > 0, 
    [node.children.length, node.streams.length]
  );
  
  const totalStreams = useMemo(() => 
    node.streams.length + node.children.reduce((acc, child) => acc + child.streams.length, 0),
    [node.streams.length, node.children]
  );
  
  // Virtualization configuration
  const { maxHeight = 400, itemHeight = 48, threshold = 20 } = virtualizationConfig;
  const totalChildren = node.streams.length + node.children.length;
  const shouldUseVirtualization = enableVirtualization && totalChildren > threshold;

  // Memoized event handlers
  const handleSpaceCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      dispatch(selectAllStreamsInSpace({ spaceId: node.id, spaces }));
    } else {
      dispatch(deselectAllStreamsInSpace({ spaceId: node.id, spaces }));
    }
  }, [node.id, spaces, dispatch]);

  const handleToggleExpand = useCallback(() => {
    dispatch(toggleExpandedNode(node.id));
  }, [node.id, dispatch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleExpand();
    }
  }, [handleToggleExpand]);

  const handleAddStreamClick = useCallback(() => {
    setIsAddingStream(true);
    setNewStreamName('');
  }, []);

  const handleSubmitStream = useCallback(async () => {
    if (newStreamName.trim()) {
      // Generate temporary ID for optimistic update
      const tempId = Date.now();
      const tempStream = {
        id: tempId,
        name: newStreamName.trim()
      };

      // Optimistic update
      dispatch(addStreamOptimistically({ spaceId: node.id, stream: tempStream }));
      handleCancelStream();
      try {
        // Make API call
        const result = await dispatch(addStream({ spaceId: node.id, streamName: newStreamName.trim() })).unwrap();
        
        // Replace temp stream with real one
        dispatch(replaceStreamOptimistically({ 
          oldId: tempId, 
          newStream: result.stream 
        }));
        
        // Show success toast
        dispatch(addToast({
          id: Date.now().toString(),
          message: `Stream "${newStreamName.trim()}" added successfully!`,
          type: 'success'
        }));
        
      } catch (error) {
        // Remove optimistic update on error
        dispatch(removeStreamOptimistically(tempId));
        
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
        dispatch(addToast({
          id: Date.now().toString(),
          message: `Failed to add stream: ${errorMessage}`,
          type: 'error'
        }));
      }
    }
  }, [newStreamName, node.id, dispatch]);

  const handleCancelStream = useCallback(() => {
    setIsAddingStream(false);
    setNewStreamName('');
  }, []);

  const handleStreamInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitStream();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelStream();
    }
 
  }, [handleSubmitStream, handleCancelStream]);

  const handleStreamNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewStreamName(e.target.value);
  }, []);

  // Focus input when adding stream
  useEffect(() => {
    if (isAddingStream && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingStream]);

  const getCheckboxRef = useCallback((state: CheckboxState) => {
    switch (state) {
      case 'checked':
        return true;
      case 'unchecked':
        return false;
      case 'indeterminate':
        return false;
    }
  }, []);

  return (
    <div className="space-node">
      <div 
        className="space-node__header"
        style={{ paddingLeft: getLevelPadding(level, 'space-node-header') }}
      >
        {hasChildren && (
          <button
            type="button"
            onClick={handleToggleExpand}
            onKeyDown={handleKeyDown}
            className={`space-node__expand-btn ${node.isExpanded ? 'expanded' : ''}`}
            aria-label={`${node.isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
            tabIndex={0}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="space-node__expand-icon"
            >
              <path 
                d="M4.5 3L7.5 6L4.5 9" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        
        <div className="space-node__content">
          <label className="space-node__label">
            <input
              type="checkbox"
              checked={getCheckboxRef(checkboxState)}
              ref={(input) => {
                if (input) {
                  input.indeterminate = checkboxState === 'indeterminate';
                }
              }}
              onChange={handleSpaceCheckboxChange}
              className="space-node__checkbox"
              aria-label={`Select all streams in ${node.name}`}
            />
            <div className="space-node__info">
              <span className="space-node__name">{node.name}</span>
              {totalStreams > 0 && (
                <span className="space-node__stream-count">
                  {totalStreams} stream{totalStreams !== 1 ? 's' : ''}
                  {shouldUseVirtualization && (
                    <span className="space-node__virtualization-indicator" title="Virtualized rendering enabled">
                      ⚡
                    </span>
                  )}
                </span>
              )}
            </div>
          </label>
          {!isAddingStream ? (
            <button
              type="button"
              onClick={handleAddStreamClick}
              className="space-node__add-btn"
              aria-label={`Add stream to ${node.name}`}
              title="Add stream"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 5V19M5 12H19" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <div className="space-node__inline-input">
              <input
                ref={inputRef}
                type="text"
                value={newStreamName}
                onChange={handleStreamNameChange}
                onKeyDown={handleStreamInputKeyDown}
                placeholder="Enter stream name..."
                className="space-node__stream-input"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSubmitStream}
                className="space-node__submit-btn"
                disabled={!newStreamName.trim()}
                title="Add stream"
              >
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M20 6L9 17L4 12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleCancelStream}
                className="space-node__cancel-btn"
                title="Cancel"
              >
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M18 6L6 18M6 6L18 18" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {node.isExpanded && (
        shouldUseVirtualization ? (
          <VirtualizedChildren
            streams={node.streams}
            childNodes={node.children}
            level={level}
            maxHeight={maxHeight}
            itemHeight={itemHeight}
          />
        ) : (
          <div className="space-node__children">
            {/* Render streams in this space */}
            {node.streams.map((stream) => (
              <StreamItem
                key={stream.id}
                stream={stream}
                level={level + 1}
              />
            ))}
            
            {/* Render child spaces */}
            {node.children.map((childNode) => (
              <SpaceNode
                key={childNode.id}
                node={childNode}
                level={level + 1}
                enableVirtualization={enableVirtualization}
                virtualizationConfig={virtualizationConfig}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

SpaceNode.displayName = 'SpaceNode'; 