import React from 'react';
import Toast from './Toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { removeToast } from '../store/slices/toastSlice';

const ToastContainer: React.FC = () => {
  const toasts = useAppSelector(state => state.toast.toasts);
  const dispatch = useAppDispatch();

  const handleRemoveToast = (id: string) => {
    dispatch(removeToast(id));
  };

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
            onClose={handleRemoveToast}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer; 