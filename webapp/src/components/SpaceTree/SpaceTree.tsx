import React, { useMemo } from 'react';
import { SpaceNode } from './SpaceNode';
import { useAppSelector } from '../../store/hooks';

export const SpaceTree: React.FC = () => {
  // Redux state selectors
  const spaces = useAppSelector(state => state.spaces.optimisticSpaces);
  const expandedNodes = useAppSelector(state => state.spaces.expandedNodes);
  const loading = useAppSelector(state => state.spaces.loading);
  const selectedSiteId = useAppSelector(state => state.site.selectedSiteId);
  const error = useAppSelector(state => state.spaces.error);

  // Static virtualization configuration
  const virtualizationConfig = useMemo(() => ({
    enabled: true,
    maxHeight: 400,
    itemHeight: 48,
    threshold: 7
  }), []);

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

  // Helper function to determine content state
  const getContentState = () => {
    if (loading) return 'loading';
    if (!selectedSiteId) return 'no-site-selected';
    if (error) return 'error';
    if (spaces.length === 0) return 'no-spaces';
    return 'has-spaces';
  };

  // Render content based on state
  const renderContent = () => {
    switch (getContentState()) {
      case 'loading':
        return (
          <div className="space-tree__skeleton">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-tree__skeleton-item">
                <div className="space-tree__skeleton-checkbox"></div>
                <div className="space-tree__skeleton-text"></div>
              </div>
            ))}
          </div>
        );

      case 'no-site-selected':
        return (
          <div className="space-tree__empty">
            <div className="space-tree__empty-icon">🏢</div>
            <h4 className="space-tree__empty-title">No site selected</h4>
            <p className="space-tree__empty-description">
              Please select a site from the dropdown above to view its spaces.
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="space-tree__empty">
            <div className="space-tree__empty-icon">❌</div>
            <h4 className="space-tree__empty-title">Error loading spaces</h4>
            <p className="space-tree__empty-description">
              {error || 'Failed to load spaces. Please try again.'}
            </p>
          </div>
        );

      case 'no-spaces':
        return (
          <div className="space-tree__empty">
            <div className="space-tree__empty-icon">📁</div>
            <h4 className="space-tree__empty-title">No spaces available</h4>
            <p className="space-tree__empty-description">
              This site doesn't have any spaces configured yet.
            </p>
          </div>
        );

      case 'has-spaces':
        return spacesWithExpansion.map((node) => (
          <SpaceNode
            key={node.id}
            node={node}
            level={0}
            enableVirtualization={virtualizationConfig.enabled}
            virtualizationConfig={virtualizationConfig}
          />
        ));

      default:
        return null;
    }
  };

  return (
    <div className="space-tree">
      <div className="space-tree__header">
        <h3 className="space-tree__title">Spaces</h3>

        {loading && (
          <div className="space-tree__loading-indicator">
            <div className="loading-spinner"></div>
            <span>Loading spaces...</span>
          </div>
        )}
        {!loading && selectedSiteId && spaces.length > 0 && (
          <div className="space-tree__stats">
            <span className="space-tree__stat">
              {spacesWithExpansion.length} space{spacesWithExpansion.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-tree__content">
        {renderContent()}
      </div>
    </div>
  );
}; 