import React, { useCallback } from 'react';
import { Stream } from '../../types/api.types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleStreamSelection } from '../../store/slices/selectionSlice';
import { removeStreamOptimistically, removeStream, setOptimisticSpaces } from '../../store/slices/spacesSlice';
import { addToast } from '../../store/slices/toastSlice';
import { getLevelPadding } from '../../utils/treeUtils';

interface StreamItemProps {
  stream: Stream;
  level: number;
}

export const StreamItem: React.FC<StreamItemProps> = ({
  stream,
  level
}) => {
  const dispatch = useAppDispatch();
  const selectedStreamIds = useAppSelector(state => state.selection.selectedStreamIds);
  const spaces = useAppSelector(state => state.spaces.optimisticSpaces);
  
  const isSelected = selectedStreamIds.has(stream.id);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(toggleStreamSelection(stream.id));
  }, [stream.id, dispatch]);

  const handleDeleteClick = useCallback(async () => {
    // Find stream name for toast message
    const findStreamName = (nodes: any[]): string | null => {
      for (const node of nodes) {
        const streammer = node?.streams?.find((s: any) => s.id === stream.id);
        if (streammer) return streammer.name;
        const found = findStreamName(node.children);
        if (found) return found;
      }
      return null;
    };
    
    const streamName = findStreamName(spaces) || 'Stream';

    // Optimistic update
    dispatch(removeStreamOptimistically(stream.id));

    try {
      
      // Make API call
      await dispatch(removeStream(stream.id)).unwrap();
      
      // Show success toast
      dispatch(addToast({
        id: Date.now().toString(),
        message: `Stream "${streamName}" deleted successfully!`,
        type: 'success'
      }));
      
    } catch (error) {
      // Revert optimistic state by syncing with real state
      dispatch(setOptimisticSpaces(spaces));
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      dispatch(addToast({
        id: Date.now().toString(),
        message: `Failed to delete stream: ${errorMessage}`,
        type: 'error'
      }));
    }
  }, [stream.id, spaces, dispatch]);

  return (
    <div 
      className="stream-item"
      style={{ paddingLeft: getLevelPadding(level, 'stream-item') }}
    >
      <label className="stream-item__label">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="stream-item__checkbox"
          aria-label={`Select ${stream.name}`}
        />
        <div className="stream-item__content">
          <div className="stream-item__icon">
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M15 10L19.552 7.724C19.834 7.551 20.178 7.502 20.495 7.587C20.812 7.672 21.073 7.884 21.211 8.164L22.5 10.5L21.211 12.836C21.073 13.116 20.812 13.328 20.495 13.413C20.178 13.498 19.834 13.449 19.552 13.276L15 11V10Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M3 7C3 5.89543 3.89543 5 5 5H13C14.1046 5 15 5.89543 15 7V17C15 18.1046 14.1046 19 13 19H5C3.89543 19 3 18.1046 3 17V7Z" 
                stroke="currentColor" 
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <span className="stream-item__name">{stream.name}</span>
        </div>
        <button
          type="button"
          onClick={handleDeleteClick}
          className="stream-item__delete-btn"
          aria-label={`Delete ${stream.name}`}
          title="Delete stream"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </label>
    </div>
  );
}; 