import { Diagram, DiagramNode, DiagramEdge } from './diagram-types';

export class DiagramStore {
  private diagram: Diagram = { nodes: [], edges: [] };

  get state(): Diagram {
    return this.diagram;
  }

  addNode(partial: Partial<DiagramNode>): DiagramNode {
    const node: DiagramNode = {
      id: crypto.randomUUID(),
      type: partial.type ?? 'rectangle',
      x: partial.x ?? 100,
      y: partial.y ?? 100,
      width: partial.width ?? 160,
      height: partial.height ?? 80,
      label: partial.label ?? 'Bloc',
      color: partial.color ?? '#4a90e2',
    };
    this.diagram.nodes.push(node);
    return node;
  }

  updateNodePosition(id: string, x: number, y: number) {
    const node = this.diagram.nodes.find(n => n.id === id);
    if (!node) return;
    node.x = x;
    node.y = y;
  }

  addEdge(fromId: string, toId: string, label?: string): DiagramEdge {
    const edge: DiagramEdge = {
      id: crypto.randomUUID(),
      fromNodeId: fromId,
      toNodeId: toId,
      label,
    };
    this.diagram.edges.push(edge);
    return edge;
  }

  toJSON(): string {
    return JSON.stringify(this.diagram, null, 2);
  }
}
