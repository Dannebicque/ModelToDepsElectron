export type NodeType = 'rectangle' | 'ellipse' | 'step';

export interface DiagramNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

export interface DiagramEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
}

export interface Diagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
