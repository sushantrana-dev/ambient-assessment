import { Space, TreeNode, Stream, CheckboxState } from '../types/api.types';

export const buildTreeFromFlat = (spaces: Space[]): TreeNode[] => {
  const spaceMap = new Map<number, TreeNode>();
  const rootNodes: TreeNode[] = [];
  // First pass: create all nodes
  spaces.forEach(space => {
    spaceMap.set(space.id, {
      ...space,
      children: [],
      isExpanded: false
    });
  });

  // Second pass: build parent-child relationships
  spaces.forEach(space => {
    const node = spaceMap.get(space.id)!;
    
    if (space.parentSpaceId === null) {
      rootNodes.push(node);
    } else {
      const parent = spaceMap.get(space.parentSpaceId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return rootNodes;
};

export const getAllStreamsInTree = (nodes: TreeNode[]): Stream[] => {
  const streams: Stream[] = [];
  
  const collectStreams = (node: TreeNode) => {
    streams.push(...node.streams);
    node.children.forEach(collectStreams);
  };
  
  nodes.forEach(collectStreams);
  return streams;
};

export const getAllStreamIdsInTree = (nodes: TreeNode[]): number[] => {
  return getAllStreamsInTree(nodes).map(stream => stream.id);
};

export const getSelectedStreamsInTree = (nodes: TreeNode[], selectedStreamIds: Set<number>): Stream[] => {
  const streams: Stream[] = [];
  
  const collectSelectedStreams = (node: TreeNode) => {
    node.streams.forEach(stream => {
      if (selectedStreamIds.has(stream.id)) {
        streams.push(stream);
      }
    });
    node.children.forEach(collectSelectedStreams);
  };
  
  nodes.forEach(collectSelectedStreams);
  return streams;
};

export const calculateSpaceCheckboxState = (
  node: TreeNode, 
  selectedStreamIds: Set<number>
): CheckboxState => {
  const allStreamIds = getAllStreamIdsInTree([node]);
  const selectedCount = allStreamIds.filter(id => selectedStreamIds.has(id)).length;
  
  if (selectedCount === 0) return 'unchecked';
  if (selectedCount === allStreamIds.length) return 'checked';
  return 'indeterminate';
};

export const updateStreamSelection = (
  nodes: TreeNode[], 
  streamId: number, 
  selected: boolean,
  selectedStreamIds: Set<number>
): Set<number> => {
  const newSelectedIds = new Set(selectedStreamIds);
  
  if (selected) {
    newSelectedIds.add(streamId);
  } else {
    newSelectedIds.delete(streamId);
  }
  
  return newSelectedIds;
};

export const updateSpaceSelection = (
  nodes: TreeNode[],
  spaceId: number,
  selected: boolean,
  selectedStreamIds: Set<number>
): Set<number> => {
  const newSelectedIds = new Set(selectedStreamIds);
  
  const findSpaceAndUpdate = (nodeList: TreeNode[]): boolean => {
    for (const node of nodeList) {
      if (node.id === spaceId) {
        const allStreamIds = getAllStreamIdsInTree([node]);
        allStreamIds.forEach(id => {
          if (selected) {
            newSelectedIds.add(id);
          } else {
            newSelectedIds.delete(id);
          }
        });
        return true;
      }
      if (findSpaceAndUpdate(node.children)) {
        return true;
      }
    }
    return false;
  };
  
  findSpaceAndUpdate(nodes);
  return newSelectedIds;
}; 