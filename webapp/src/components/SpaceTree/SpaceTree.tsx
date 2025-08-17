import React, { useMemo } from 'react';
import { SpaceNode } from './SpaceNode';
import { useAppSelector } from '../../store/hooks';

interface SpaceTreeProps {
  isLoading?: boolean;
  enableVirtualization?: boolean;
  virtualizationConfig?: {
    maxHeight?: number;
    itemHeight?: number;
    threshold?: number;
  };
}

export const SpaceTree: React.FC<SpaceTreeProps> = ({
  isLoading = false,
  enableVirtualization = true,
  virtualizationConfig = {}
}) => {
  // Redux state selectors
  const spaces = useAppSelector(state => state.spaces.optimisticSpaces);
  const selectedStreamIds = useAppSelector(state => state.selection.selectedStreamIds);
  const expandedNodes = useAppSelector(state => state.spaces.expandedNodes);

  // Update nodes with expansion state
  const spacesWithExpansion = useMemo(() => {
    const updateNodeExpansion = (nodes: any[]): any[] => {
      return nodes.map(node => ({
        ...node,
        isExpanded: expandedNodes.has(node.id),
        children: updateNodeExpansion(node.children)
      }));
    };
    return updateNodeExpansion(spaces);
  }, [spaces, expandedNodes]);

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
            level={0}
            enableVirtualization={enableVirtualization}
            virtualizationConfig={virtualizationConfig}
          />
        ))}
      </div>
    </div>
  );
}; 