import { TreeNode, Stream } from '../types/api.types';

// Spaces slice types
export interface SpacesState {
  spaces: TreeNode[];
  optimisticSpaces: TreeNode[];
  loading: boolean;
  error: string | null;
  expandedNodes: Set<number>;
}

// Selection slice types
export interface SelectionState {
  selectedStreamIds: Set<number>;
}

// Site slice types
export interface SiteState {
  selectedSiteId: string | null;
}

// Toast slice types
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export interface ToastState {
  toasts: ToastMessage[];
}

// Root state type
export interface RootState {
  spaces: SpacesState;
  selection: SelectionState;
  site: SiteState;
  toast: ToastState;
}

// App dispatch type
export type AppDispatch = any; // This will be properly typed when we import from the store 