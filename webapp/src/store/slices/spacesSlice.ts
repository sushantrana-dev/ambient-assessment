import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TreeNode, Stream, Space, SpacesGroup, FlattenedSpacesData } from '../../types/api.types';
import { buildTreeFromFlat } from '../../utils/treeUtils';
import { addStreamToSpace, deleteStream } from '../../hooks/useApi';

interface SpacesState {
  spaces: TreeNode[];
  optimisticSpaces: TreeNode[];
  loading: boolean;
  error: string | null;
  expandedNodes: Set<number>;
}

const initialState: SpacesState = {
  spaces: [],
  optimisticSpaces: [],
  loading: false,
  error: null,
  expandedNodes: new Set(),
};

// Async thunk for fetching spaces
export const fetchSpaces = createAsyncThunk(
  'spaces/fetchSpaces',
  async (siteId: string) => {
    const response = await fetch(`https://interviews.ambient.ai/api/v1/spaces/?siteId=${siteId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as FlattenedSpacesData;
  }
);

// Async thunk for adding stream
export const addStream = createAsyncThunk(
  'spaces/addStream',
  async ({ spaceId, streamName }: { spaceId: number; streamName: string }) => {
    const response = await addStreamToSpace(spaceId, streamName);
    return { spaceId, stream: response };
  }
);

// Async thunk for deleting stream
export const removeStream = createAsyncThunk(
  'spaces/removeStream',
  async (streamId: number) => {
    await deleteStream(streamId);
    return streamId;
  }
);

const spacesSlice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    setExpandedNodes: (state, action: PayloadAction<Set<number>>) => {
      state.expandedNodes = action.payload;
    },
    toggleExpandedNode: (state, action: PayloadAction<number>) => {
      const nodeId = action.payload;
      if (state.expandedNodes.has(nodeId)) {
        state.expandedNodes.delete(nodeId);
      } else {
        state.expandedNodes.add(nodeId);
      }
    },
    setOptimisticSpaces: (state, action: PayloadAction<TreeNode[]>) => {
      state.optimisticSpaces = action.payload;
    },
    addStreamOptimistically: (state, action: PayloadAction<{ spaceId: number; stream: Stream }>) => {
      const { spaceId, stream } = action.payload;
      const addToTree = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map(node => {
          if (node.id === spaceId) {
            return {
              ...node,
              streams: [...node.streams, stream]
            };
          }
          return {
            ...node,
            children: addToTree(node.children)
          };
        });
      };
      state.optimisticSpaces = addToTree(state.optimisticSpaces);
    },
    removeStreamOptimistically: (state, action: PayloadAction<number>) => {
      const streamId = action.payload;
      const removeFromTree = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map(node => ({
          ...node,
          streams: node.streams.filter(stream => stream.id !== streamId),
          children: removeFromTree(node.children)
        }));
      };
      state.optimisticSpaces = removeFromTree(state.optimisticSpaces);
    },
    replaceStreamOptimistically: (state, action: PayloadAction<{ oldId: number; newStream: Stream }>) => {
      const { oldId, newStream } = action.payload;
      const replaceInTree = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map(node => ({
          ...node,
          streams: node.streams.map(stream => 
            stream.id === oldId ? newStream : stream
          ),
          children: replaceInTree(node.children)
        }));
      };
      state.optimisticSpaces = replaceInTree(state.optimisticSpaces);
    },
    clearSpaces: (state) => {
      state.spaces = [];
      state.optimisticSpaces = [];
      state.expandedNodes = new Set();
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpaces.fulfilled, (state, action) => {
        state.loading = false;
        // Flatten the nested structure
        const flattenedSpaces: Space[] = [];
        action.payload.spaces.forEach((group: SpacesGroup) => {
          if (group.spaces) {
            flattenedSpaces.push(...group.spaces);
          }
        });
        
        const tree = buildTreeFromFlat(flattenedSpaces);
        state.spaces = tree;
        state.optimisticSpaces = tree;
        state.expandedNodes = new Set();
      })
      .addCase(fetchSpaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch spaces';
        state.spaces = [];
        state.optimisticSpaces = [];
      })
      .addCase(addStream.fulfilled, (state, action) => {
        const { spaceId, stream } = action.payload;
        // Only update the real spaces state, optimisticSpaces is handled by replaceStreamOptimistically
        const updateTree = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(node => {
            if (node.id === spaceId) {
              return {
                ...node,
                streams: [...node.streams, stream]
              };
            }
            return {
              ...node,
              children: updateTree(node.children)
            };
          });
        };
        state.spaces = updateTree(state.spaces);
        // Don't update optimisticSpaces here - it's handled by the replaceStreamOptimistically action
      })
      .addCase(removeStream.fulfilled, (state, action) => {
        const streamId = action.payload;
        const removeFromTree = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(node => ({
            ...node,
            streams: node.streams.filter(stream => stream.id !== streamId),
            children: removeFromTree(node.children)
          }));
        };
        state.spaces = removeFromTree(state.spaces);
        state.optimisticSpaces = removeFromTree(state.optimisticSpaces);
      });
  },
});

export const {
  setExpandedNodes,
  toggleExpandedNode,
  setOptimisticSpaces,
  addStreamOptimistically,
  removeStreamOptimistically,
  replaceStreamOptimistically,
  clearSpaces,
} = spacesSlice.actions;

export default spacesSlice.reducer; 