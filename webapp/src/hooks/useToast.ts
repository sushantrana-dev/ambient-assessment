import { useState, useCallback } from 'react';
import { ToastMessage } from '../components/ToastContainer';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', duration?: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      id,
      message,
      type,
      duration,
    };
    
    setToasts(prev => {
      // Limit to maximum 5 toasts to prevent overflow
      const updatedToasts = [...prev, newToast];
      if (updatedToasts.length > 5) {
        return updatedToasts.slice(-5);
      }
      return updatedToasts;
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message: string, duration?: number) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
  };
}; 