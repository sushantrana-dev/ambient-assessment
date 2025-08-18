import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TreeNode, Stream } from '../../types/api.types';
import { StreamItem } from '../SpaceTree/StreamItem';
import { SpaceNode } from '../SpaceTree/SpaceNode';
import { getVirtualizedHeightClass, getVirtualizedItemHeightClass } from '../../utils/treeUtils';

interface VirtualizedChildrenProps {
  streams: Stream[];
  childNodes: TreeNode[];
  level: number;
  maxHeight?: number;
  itemHeight?: number;
}

interface ChildItem {
  type: 'stream' | 'space';
  id: number;
  data: Stream | TreeNode;
  index: number;
}

export function VirtualizedChildren({
  streams,
  childNodes,
  level,
  maxHeight = 300,
  itemHeight = 48
}: VirtualizedChildrenProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create a flat array of all children (streams + spaces)
  const allChildren = useMemo((): ChildItem[] => {
    const items: ChildItem[] = [];
    let index = 0;

    // Add streams
    streams.forEach(stream => {
      items.push({
        type: 'stream',
        id: stream.id,
        data: stream,
        index: index++
      });
    });

    // Add child spaces
    childNodes.forEach(node => {
      items.push({
        type: 'space',
        id: node.id,
        data: node,
        index: index++
      });
    });

    return items;
  }, [streams, childNodes]);

  const totalHeight = allChildren.length * itemHeight;
  const overscan = 3;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    allChildren.length - 1,
    Math.ceil((scrollTop + maxHeight) / itemHeight) + overscan
  );

  const visibleItems = allChildren.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Reset scroll position when children change significantly
  useEffect(() => {
    if (containerRef.current && Math.abs(allChildren.length - prevChildrenLength.current) > 5) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
    prevChildrenLength.current = allChildren.length;
  }, [allChildren.length]);

  const prevChildrenLength = useRef(allChildren.length);

  const renderChild = useCallback((item: ChildItem) => {
    if (item.type === 'stream') {
      const stream = item.data as Stream;
      return (
        <StreamItem
          key={stream.id}
          stream={stream}
          level={level + 1}
        />
      );
    } else {
      const spaceNode = item.data as TreeNode;
      return (
        <SpaceNode
          key={spaceNode.id}
          node={spaceNode}
          level={level + 1}
        />
      );
    }
  }, [level]);

  // If no children, return null
  if (allChildren.length === 0) {
    return null;
  }

  // If children fit within maxHeight, render normally without virtualization
  if (totalHeight <= maxHeight) {
    return (
      <div className="space-node__children">
        {allChildren.map(item => renderChild(item))}
      </div>
    );
  }

  // Use virtualization for large lists
  return (
    <div className="space-node__children virtualized-children">
      <div
        ref={containerRef}
        className={`virtualized-children__container ${getVirtualizedHeightClass(maxHeight)}`}
        onScroll={handleScroll}
      >
        <div className="virtualized-children__viewport">
          <div className="virtualized-children__content">
            {visibleItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className={`virtualized-children__item ${getVirtualizedItemHeightClass(itemHeight)}`}
              >
                {renderChild(item)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 