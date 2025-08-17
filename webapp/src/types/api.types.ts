export interface Site {
  id: string;
  name: string;
}

export interface Stream {
  id: number;
  name: string;
}

export interface Space {
  id: number;
  name: string;
  streams: Stream[];
  parentSpaceId: number | null;
}

export interface SpacesGroup {
  spaces: Space[];
}

export interface FlattenedSpacesData {
  spaces: SpacesGroup[];
}

export interface TreeNode {
  id: number;
  name: string;
  streams: Stream[];
  parentSpaceId: number | null;
  children: TreeNode[];
  isExpanded?: boolean;
}

export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate'; 