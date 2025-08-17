import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastState {
  toasts: ToastMessage[];
}

const initialState: ToastState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<ToastMessage>) => {
      state.toasts.push(action.payload);
      // Limit to maximum 5 toasts to prevent overflow
      if (state.toasts.length > 5) {
        state.toasts = state.toasts.slice(-5);
      }
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const {
  addToast,
  removeToast,
  clearToasts,
} = toastSlice.actions;

export default toastSlice.reducer; 