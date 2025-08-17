import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import spacesReducer from './slices/spacesSlice';
import selectionReducer from './slices/selectionSlice';
import siteReducer from './slices/siteSlice';
import toastReducer from './slices/toastSlice';

// Enable Immer's MapSet plugin to handle Set objects
enableMapSet();

export const store = configureStore({
  reducer: {
    spaces: spacesReducer,
    selection: selectionReducer,
    site: siteReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['spaces/setOptimisticSpaces'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.expandedNodes', 'payload.selectedStreamIds'],
        // Ignore these paths in the state
        ignoredPaths: ['spaces.expandedNodes', 'selection.selectedStreamIds'],
      },
    }),
});

export type AppDispatch = typeof store.dispatch; 