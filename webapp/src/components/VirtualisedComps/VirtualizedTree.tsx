import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TreeNode, Stream } from '../../types/api.types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleExpandedNode } from '../../store/slices/spacesSlice';
import { selectAllStreamsInSpace, deselectAllStreamsInSpace } from '../../store/slices/selectionSlice';
import { StreamItem } from '../SpaceTree/StreamItem';
import { getLevelPadding, getVirtualizedHeightClass, getVirtualizedItemHeightClass } from '../../utils/treeUtils';

interface VirtualizedTreeProps {
  streams: Stream[];
  childNodes: TreeNode[];
  level: number;
  containerHeight?: number;
  itemHeight?: number;
}

interface TreeItem {
  type: 'stream' | 'space';
  id: number;
  data: Stream | TreeNode;
  level: number;
}

export function VirtualizedTree({
  streams,
  childNodes,
  level,
  containerHeight = 400,
  itemHeight = 40
}: VirtualizedTreeProps) {
  const dispatch = useAppDispatch();
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Redux state selectors
  const selectedStreamIds = useAppSelector(state => state.selection.selectedStreamIds);
  const spaces = useAppSelector(state => state.spaces.optimisticSpaces);

  // Flatten the tree structure into a linear array
  const flattenedItems = useMemo((): TreeItem[] => {
    const items: TreeItem[] = [];
    
    // Add streams
    streams.forEach(stream => {
      items.push({
        type: 'stream',
        id: stream.id,
        data: stream,
        level: level + 1
      });
    });
    
    // Add child spaces recursively
    const addChildSpaces = (nodes: TreeNode[], currentLevel: number) => {
      nodes.forEach(node => {
        items.push({
          type: 'space',
          id: node.id,
          data: node,
          level: currentLevel + 1
        });
        
        // Add streams in this space
        node.streams.forEach(stream => {
          items.push({
            type: 'stream',
            id: stream.id,
            data: stream,
            level: currentLevel + 2
          });
        });
        
        // Recursively add child spaces
        if (node.children.length > 0) {
          addChildSpaces(node.children, currentLevel + 1);
        }
      });
    };
    
    addChildSpaces(childNodes, level);
    return items;
  }, [streams, childNodes, level]);

  const totalHeight = flattenedItems.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 3);
  const endIndex = Math.min(
    flattenedItems.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + 3
  );

  const visibleItems = flattenedItems.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const renderItem = useCallback((item: TreeItem, index: number) => {
    if (item.type === 'stream') {
      const stream = item.data as Stream;
      return (
        <StreamItem
          key={stream.id}
          stream={stream}
          level={item.level}
        />
      );
    } else {
      const spaceNode = item.data as TreeNode;
      return (
        <div 
          key={spaceNode.id}
          className="space-node"
          style={{ paddingLeft: getLevelPadding(item.level, 'space-node') }}
        >
          <div className="space-node__header">
            <button
              type="button"
              onClick={() => dispatch(toggleExpandedNode(spaceNode.id))}
              className={`space-node__expand-btn ${spaceNode.isExpanded ? 'expanded' : ''}`}
              aria-label={`${spaceNode.isExpanded ? 'Collapse' : 'Expand'} ${spaceNode.name}`}
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
            
            <div className="space-node__content">
              <label className="space-node__label">
                <input
                  type="checkbox"
                  checked={false} // This would need to be calculated
                  onChange={(e) => {
                    if (e.target.checked) {
                      dispatch(selectAllStreamsInSpace({ spaceId: spaceNode.id, spaces }));
                    } else {
                      dispatch(deselectAllStreamsInSpace({ spaceId: spaceNode.id, spaces }));
                    }
                  }}
                  className="space-node__checkbox"
                  aria-label={`Select all streams in ${spaceNode.name}`}
                />
                <div className="space-node__info">
                  <span className="space-node__name">{spaceNode.name}</span>
                  {spaceNode.streams.length > 0 && (
                    <span className="space-node__stream-count">
                      {spaceNode.streams.length} stream{spaceNode.streams.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>
      );
    }
  }, [selectedStreamIds, dispatch, spaces]);

  // Reset scroll position when items change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [flattenedItems.length]);

  if (flattenedItems.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`virtualized-tree ${getVirtualizedHeightClass(containerHeight)}`}
      onScroll={handleScroll}
    >
      <div className="virtualized-tree__viewport">
        <div className="virtualized-tree__content">
          {visibleItems.map((item, index) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`virtualized-tree__item ${getVirtualizedItemHeightClass(itemHeight)}`}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 