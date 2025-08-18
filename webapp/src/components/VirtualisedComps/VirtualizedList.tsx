import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getVirtualizedHeightClass, getVirtualizedItemHeightClass } from '../../utils/treeUtils';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  className = ''
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Reset scroll position when items change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      className={`virtualized-list ${getVirtualizedHeightClass(containerHeight)} ${className}`}
      onScroll={handleScroll}
    >
      <div
        className="virtualized-list__viewport"
      >
        <div
          className="virtualized-list__content"
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              className={`virtualized-list__item ${getVirtualizedItemHeightClass(itemHeight)}`}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 