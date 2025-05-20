export interface Node {
  id: string;
  name: string;
  type: "switch" | "host";
  ip: string;
  color: string;
  val: number;
  x?: number;
  y?: number;
}

export interface Link {
  source: string;
  target: string;
}

export interface Network {
  graphData: {
    nodes: Node[];
    links: Link[];
  };
  selectedNode: Node | null;
  selectedNodes: Set<string>;
  setSelectedNode: (node: Node | null) => void;
  toggleNodeSelection: (nodeId: string, isShiftKey: boolean) => void;
  clearSelection: () => void;
}

export interface NodeInfoPanelProps {
  node: Node | null;
  onClose: () => void;
}
