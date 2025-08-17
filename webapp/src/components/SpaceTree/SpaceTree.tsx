import React, { useState } from 'react';
import { TreeNode } from '../../types/api.types';
import { SpaceNode } from './SpaceNode';
import { updateStreamSelection, updateSpaceSelection } from '../../utils/treeUtils';

interface SpaceTreeProps {
  spaces: TreeNode[];
  selectedStreamIds: Set<number>;
  onSelectionChange: (selectedStreamIds: Set<number>) => void;
  onAddStream: (spaceId: number, streamName: string) => void;
  onDeleteStream: (streamId: number) => void;
  isLoading?: boolean;
  enableVirtualization?: boolean;
  virtualizationConfig?: {
    maxHeight?: number;
    itemHeight?: number;
    threshold?: number;
  };
}

export const SpaceTree: React.FC<SpaceTreeProps> = ({
  spaces,
  selectedStreamIds,
  onSelectionChange,
  onAddStream,
  onDeleteStream,
  isLoading = false,
  enableVirtualization = true,
  virtualizationConfig = {}
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const handleStreamSelectionChange = (streamId: number, selected: boolean) => {
    const newSelectedIds = updateStreamSelection(spaces, streamId, selected, selectedStreamIds);
    onSelectionChange(newSelectedIds);
  };

  const handleSpaceSelectionChange = (spaceId: number, selected: boolean) => {
    const newSelectedIds = updateSpaceSelection(spaces, spaceId, selected, selectedStreamIds);
    onSelectionChange(newSelectedIds);
  };

  const handleToggleExpand = (spaceId: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spaceId)) {
        newSet.delete(spaceId);
      } else {
        newSet.add(spaceId);
      }
      return newSet;
    });
  };

  const updateNodeExpansion = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.map(node => ({
      ...node,
      isExpanded: expandedNodes.has(node.id),
      children: updateNodeExpansion(node.children)
    }));
  };

  const spacesWithExpansion = updateNodeExpansion(spaces);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-tree">
        <div className="space-tree__header">
          <h3 className="space-tree__title">Spaces</h3>
          <div className="space-tree__loading-indicator">
            <div className="loading-spinner"></div>
            <span>Loading spaces...</span>
          </div>
        </div>
        <div className="space-tree__skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-tree__skeleton-item">
              <div className="space-tree__skeleton-checkbox"></div>
              <div className="space-tree__skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (spaces.length === 0) {
    return (
      <div className="space-tree">
        <div className="space-tree__header">
          <h3 className="space-tree__title">Spaces</h3>
        </div>
        <div className="space-tree__empty">
          <div className="space-tree__empty-icon">📁</div>
          <h4 className="space-tree__empty-title">No spaces available</h4>
          <p className="space-tree__empty-description">
            This site doesn't have any spaces configured yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-tree">
      <div className="space-tree__header">
        <h3 className="space-tree__title">Spaces</h3>
        <div className="space-tree__stats">
          <span className="space-tree__stat">
            {spacesWithExpansion.length} space{spacesWithExpansion.length !== 1 ? 's' : ''}
          </span>
          <span className="space-tree__stat">
            {selectedStreamIds.size} selected
          </span>
        </div>
      </div>
      <div className="space-tree__content">
        {spacesWithExpansion.map((node) => (
          <SpaceNode
            key={node.id}
            node={node}
            selectedStreamIds={selectedStreamIds}
            onStreamSelectionChange={handleStreamSelectionChange}
            onSpaceSelectionChange={handleSpaceSelectionChange}
            onToggleExpand={handleToggleExpand}
            onAddStream={onAddStream}
            onDeleteStream={onDeleteStream}
            level={0}
            enableVirtualization={enableVirtualization}
            virtualizationConfig={virtualizationConfig}
          />
        ))}
      </div>
    </div>
  );
}; 