import React, { useCallback, useMemo } from 'react';
import { Stream } from '../../types/api.types';

interface SelectedCamerasListProps {
  selectedStreams: Stream[];
  onRemoveStream: (streamId: number) => void;
}

export const SelectedCamerasList: React.FC<SelectedCamerasListProps> = ({
  selectedStreams,
  onRemoveStream
}) => {
  // Memoize the sorted streams to prevent unnecessary re-sorting
  const sortedStreams = useMemo(() => {
    return [...selectedStreams].sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedStreams]);

  // Memoize the remove handler
  const handleRemoveStream = useCallback((streamId: number) => {
    onRemoveStream(streamId);
  }, [onRemoveStream]);

  // Memoize mouse event handlers
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const removeBtn = e.currentTarget.querySelector('.selected-cameras__remove-btn');
    if (removeBtn) {
      removeBtn.classList.add('visible');
    }
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const removeBtn = e.currentTarget.querySelector('.selected-cameras__remove-btn');
    if (removeBtn) {
      removeBtn.classList.remove('visible');
    }
  }, []);

  if (selectedStreams.length === 0) {
    return (
      <div className="selected-cameras">
        <div className="selected-cameras__header">
          <h3 className="selected-cameras__title">Selected Cameras</h3>
          <span className="selected-cameras__count">0</span>
        </div>
        <div className="selected-cameras__empty">
          <div className="selected-cameras__empty-icon">📹</div>
          <h4 className="selected-cameras__empty-title">No cameras selected</h4>
          <p className="selected-cameras__empty-description">
            Select cameras from the spaces tree to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="selected-cameras">
      <div className="selected-cameras__header">
        <h3 className="selected-cameras__title">Selected Cameras</h3>
        <span className="selected-cameras__count">{selectedStreams.length}</span>
      </div>
      <div className="selected-cameras__list">
        {sortedStreams.map((stream) => (
          <div
            key={stream.id}
            className="selected-cameras__item"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="selected-cameras__item-content">
              <div className="selected-cameras__item-icon">
                <svg 
                  width="16" 
                  height="16" 
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
              <span className="selected-cameras__stream-name">{stream.name}</span>
            </div>
            <button
              type="button"
              className="selected-cameras__remove-btn"
              onClick={() => handleRemoveStream(stream.id)}
              aria-label={`Remove ${stream.name} from selection`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}; 