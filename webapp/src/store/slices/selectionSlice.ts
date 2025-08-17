import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TreeNode } from '../../types/api.types';
import { getAllStreamIdsInTree } from '../../utils/treeUtils';

interface SelectionState {
  selectedStreamIds: Set<number>;
}

const initialState: SelectionState = {
  selectedStreamIds: new Set(),
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    setSelectedStreamIds: (state, action: PayloadAction<Set<number>>) => {
      state.selectedStreamIds = action.payload;
    },
    addStreamToSelection: (state, action: PayloadAction<number>) => {
      state.selectedStreamIds.add(action.payload);
    },
    removeStreamFromSelection: (state, action: PayloadAction<number>) => {
      state.selectedStreamIds.delete(action.payload);
    },
    toggleStreamSelection: (state, action: PayloadAction<number>) => {
      const streamId = action.payload;
      if (state.selectedStreamIds.has(streamId)) {
        state.selectedStreamIds.delete(streamId);
      } else {
        state.selectedStreamIds.add(streamId);
      }
    },
    selectAllStreamsInSpace: (state, action: PayloadAction<{ spaceId: number; spaces: TreeNode[] }>) => {
      const { spaceId, spaces } = action.payload;
      
      // Find the space and get all stream IDs in it
      const findSpaceAndGetStreamIds = (nodes: TreeNode[]): number[] => {
        for (const node of nodes) {
          if (node.id === spaceId) {
            return getAllStreamIdsInTree([node]);
          }
          const found = findSpaceAndGetStreamIds(node.children);
          if (found.length > 0) {
            return found;
          }
        }
        return [];
      };
      
      const streamIds = findSpaceAndGetStreamIds(spaces);
      streamIds.forEach(id => state.selectedStreamIds.add(id));
    },
    deselectAllStreamsInSpace: (state, action: PayloadAction<{ spaceId: number; spaces: TreeNode[] }>) => {
      const { spaceId, spaces } = action.payload;
      
      // Find the space and get all stream IDs in it
      const findSpaceAndGetStreamIds = (nodes: TreeNode[]): number[] => {
        for (const node of nodes) {
          if (node.id === spaceId) {
            return getAllStreamIdsInTree([node]);
          }
          const found = findSpaceAndGetStreamIds(node.children);
          if (found.length > 0) {
            return found;
          }
        }
        return [];
      };
      
      const streamIds = findSpaceAndGetStreamIds(spaces);
      streamIds.forEach(id => state.selectedStreamIds.delete(id));
    },
    clearSelection: (state) => {
      state.selectedStreamIds = new Set();
    },
  },
});

export const {
  setSelectedStreamIds,
  addStreamToSelection,
  removeStreamFromSelection,
  toggleStreamSelection,
  selectAllStreamsInSpace,
  deselectAllStreamsInSpace,
  clearSelection,
} = selectionSlice.actions;

export default selectionSlice.reducer; 