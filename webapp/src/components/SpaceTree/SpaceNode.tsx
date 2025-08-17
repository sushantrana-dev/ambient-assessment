import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { TreeNode, CheckboxState } from '../../types/api.types';
import { StreamItem } from './StreamItem';
import { VirtualizedChildren } from './VirtualizedChildren';
import { calculateSpaceCheckboxState } from '../../utils/treeUtils';

interface SpaceNodeProps {
  node: TreeNode;
  selectedStreamIds: Set<number>;
  onStreamSelectionChange: (streamId: number, selected: boolean) => void;
  onSpaceSelectionChange: (spaceId: number, selected: boolean) => void;
  onToggleExpand: (spaceId: number) => void;
  onAddStream: (spaceId: number, streamName: string) => void;
  onDeleteStream: (streamId: number) => void;
  level: number;
  enableVirtualization?: boolean;
  virtualizationConfig?: {
    maxHeight?: number;
    itemHeight?: number;
    threshold?: number; // Number of items before virtualization kicks in
  };
}

export const SpaceNode: React.FC<SpaceNodeProps> = ({
  node,
  selectedStreamIds,
  onStreamSelectionChange,
  onSpaceSelectionChange,
  onToggleExpand,
  onAddStream,
  onDeleteStream,
  level,
  enableVirtualization = true,
  virtualizationConfig = {}
}) => {
  const [isAddingStream, setIsAddingStream] = useState(false);
  const [newStreamName, setNewStreamName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
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
    onSpaceSelectionChange(node.id, e.target.checked);
  }, [node.id, onSpaceSelectionChange]);

  const handleToggleExpand = useCallback(() => {
    onToggleExpand(node.id);
  }, [node.id, onToggleExpand]);

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

  const handleSubmitStream = useCallback(() => {
    if (newStreamName.trim()) {
      onAddStream(node.id, newStreamName.trim());
      setIsAddingStream(false);
      setNewStreamName('');
    }
  }, [newStreamName, node.id, onAddStream]);

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
        style={{ paddingLeft: `${level * 24}px` }}
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
            selectedStreamIds={selectedStreamIds}
            onStreamSelectionChange={onStreamSelectionChange}
            onSpaceSelectionChange={onSpaceSelectionChange}
            onToggleExpand={onToggleExpand}
            onAddStream={onAddStream}
            onDeleteStream={onDeleteStream}
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
                isSelected={selectedStreamIds.has(stream.id)}
                onSelectionChange={onStreamSelectionChange}
                onDelete={onDeleteStream}
                level={level + 1}
              />
            ))}
            
            {/* Render child spaces */}
            {node.children.map((childNode) => (
              <SpaceNode
                key={childNode.id}
                node={childNode}
                selectedStreamIds={selectedStreamIds}
                onStreamSelectionChange={onStreamSelectionChange}
                onSpaceSelectionChange={onSpaceSelectionChange}
                onToggleExpand={onToggleExpand}
                onAddStream={onAddStream}
                onDeleteStream={onDeleteStream}
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