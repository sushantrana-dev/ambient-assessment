import React, { useState } from 'react';

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (streamName: string) => void;
  spaceName: string;
}

const AddStreamModal: React.FC<AddStreamModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  spaceName,
}) => {
  const [streamName, setStreamName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (streamName.trim()) {
      onAdd(streamName.trim());
      setStreamName('');
      onClose(); // Close modal immediately for better UX
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white rounded-lg p-6 w-96 max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">
          Add Stream to {spaceName}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="streamName" className="block text-sm font-medium text-gray-700 mb-2">
              Stream Name
            </label>
            <input
              type="text"
              id="streamName"
              value={streamName}
              onChange={(e) => setStreamName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter stream name"
              autoFocus
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Stream
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStreamModal; 