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
  const streamIds: number[] = [];
  
  const collectStreamIds = (node: TreeNode) => {
    node.streams.forEach(stream => streamIds.push(stream.id));
    node.children.forEach(collectStreamIds);
  };
  
  nodes.forEach(collectStreamIds);
  return streamIds;
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
  let totalStreams = 0;
  let selectedCount = 0;
  
  const countStreams = (currentNode: TreeNode) => {
    currentNode.streams.forEach(stream => {
      totalStreams++;
      if (selectedStreamIds.has(stream.id)) {
        selectedCount++;
      }
    });
    currentNode.children.forEach(countStreams);
  };
  
  countStreams(node);
  
  if (selectedCount === 0) return 'unchecked';
  if (selectedCount === totalStreams) return 'checked';
  return 'indeterminate';
};

/**
 * Calculates padding-left value for tree hierarchy indentation
 * @param level - The nesting level (0+)
 * @param type - The component type ('space-node-header', 'stream-item', 'space-node')
 * @returns padding-left value in pixels
 */
export function getLevelPadding(level: number, type: 'space-node-header' | 'stream-item' | 'space-node'): number {
  const clampedLevel = Math.max(level, 0);
  const indentSize = 24; // Base indent size in pixels
  
  let basePadding = 0;
  switch (type) {
    case 'space-node-header':
      basePadding = 0;
      break;
    case 'stream-item':
      basePadding = 36; // Additional padding for stream items
      break;
    case 'space-node':
      basePadding = 0;
      break;
  }
  
  return basePadding + (clampedLevel * indentSize);
}


/**
 * Generates CSS class for virtualization container height
 * @param height - The height in pixels
 * @returns CSS class name for the height
 */
export function getVirtualizedHeightClass(height: number): string {
  const roundedHeight = Math.round(height / 100) * 100;
  const clampedHeight = Math.min(Math.max(roundedHeight, 200), 800);
  return `virtualized-height-${clampedHeight}`;
}

/**
 * Generates CSS class for virtualization item height
 * @param height - The height in pixels
 * @returns CSS class name for the height
 */
export function getVirtualizedItemHeightClass(height: number): string {
  const roundedHeight = Math.round(height / 8) * 8;
  const clampedHeight = Math.min(Math.max(roundedHeight, 32), 64);
  return `virtualized-item-height-${clampedHeight}`;
}

/**
 * Generates CSS class for toast positioning
 * @param index - The toast index
 * @returns CSS class name for the offset
 */
export function getToastOffsetClass(index: number): string {
  const offset = index * 90;
  const clampedOffset = Math.min(offset, 450);
  return `toast-wrapper--offset-${clampedOffset}`;
} 