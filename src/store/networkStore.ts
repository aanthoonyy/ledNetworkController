import { create } from "zustand";
import type { Node, Network } from "../Interface/INetwork";
import lightControlStore from "./lightControlStore";

const randomIP = () => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(
    Math.random() * 255
  )}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const createNodeFromArduinoState = (
  nodeId: string,
  state: "on" | "off",
  color: string
): Node => ({
  id: nodeId,
  name: `Arduino ${nodeId}`,
  type: "arduino",
  ip: randomIP(),
  color: state === "on" ? color : "#808080",
  val: state === "on" ? 20 : 10,
});

const generateGraphData = () => {
  const nodes: Node[] = [];
  const arduinoNodes = lightControlStore.getNodesArray();
  arduinoNodes.forEach(([nodeId, state, color, _]) => {
    nodes.push(createNodeFromArduinoState(nodeId, state, color));
  });
  return { nodes, links: [] };
};

const handleUpdateNode =
  (nodeId: string, nodeState: "on" | "off", color: string) =>
  (currentState: Network) => {
    const nodes = [...currentState.graphData.nodes];
    const nodeIndex = nodes.findIndex((n) => n.id === nodeId);

    if (nodeIndex === -1) {
      const newNode = createNodeFromArduinoState(nodeId, nodeState, color);
      return {
        graphData: {
          nodes: [...nodes, newNode],
          links: [],
        },
      };
    } else {
      const updatedNode = {
        ...nodes[nodeIndex],
        color: nodeState === "on" ? color : "#808080",
        val: nodeState === "on" ? 20 : 10,
      };
      nodes[nodeIndex] = updatedNode;
      return {
        graphData: {
          ...currentState.graphData,
          nodes,
        },
      };
    }
  };

const handleUpdateAllNodes = (get: () => Network) => () => {
  const arduinoNodes = lightControlStore.getNodesArray();
  arduinoNodes.forEach(([nodeId, state, color, _]) => {
    get().updateNode(nodeId, state, color);
  });
};

const handleNodeSelection = (
  state: Network,
  nodeId: string,
  isShiftKey: boolean
) => {
  const newSelectedNodes = new Set(state.selectedNodes);
  const node = state.graphData.nodes.find((n) => n.id === nodeId);

  if (!isShiftKey) {
    newSelectedNodes.clear();
    newSelectedNodes.add(nodeId);
    return {
      selectedNode: node || null,
      selectedNodes: newSelectedNodes,
    };
  } else {
    if (newSelectedNodes.has(nodeId)) {
      newSelectedNodes.delete(nodeId);
      if (state.selectedNode?.id === nodeId) {
        const remainingNodes = Array.from(newSelectedNodes);
        return {
          selectedNode:
            remainingNodes.length > 0
              ? state.graphData.nodes.find((n) => n.id === remainingNodes[0]) ||
                null
              : null,
          selectedNodes: newSelectedNodes,
        };
      }
    } else {
      newSelectedNodes.add(nodeId);
      return {
        selectedNode: node || null,
        selectedNodes: newSelectedNodes,
      };
    }
    return { selectedNodes: newSelectedNodes };
  }
};

const handleClearSelection = () => ({
  selectedNode: null,
  selectedNodes: new Set<string>(),
});

export const useNetworkStore = create<Network>((set, get) => ({
  graphData: generateGraphData(),
  selectedNode: null,
  selectedNodes: new Set<string>(),

  updateNode: (nodeId: string, nodeState: "on" | "off", color: string) =>
    set(handleUpdateNode(nodeId, nodeState, color)),

  updateAllNodes: handleUpdateAllNodes(get),

  setSelectedNode: (node) => set({ selectedNode: node }),

  toggleNodeSelection: (nodeId, isShiftKey) =>
    set((state) => handleNodeSelection(state, nodeId, isShiftKey)),

  clearSelection: () => set(handleClearSelection),
}));

lightControlStore.onNodeUpdate = (
  nodeId: string,
  state: "on" | "off",
  color: string
) => {
  useNetworkStore.getState().updateNode(nodeId, state, color);
};
