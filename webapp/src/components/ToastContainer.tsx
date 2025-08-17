import React, { useState, useCallback } from 'react';
import Toast, { ToastProps } from './Toast';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemoveToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="toast-wrapper"
          style={{
            transform: `translateY(${index * 90}px)`,
            zIndex: 1000 - index, // Higher toasts have higher z-index
          }}
        >
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={onRemoveToast}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer; 