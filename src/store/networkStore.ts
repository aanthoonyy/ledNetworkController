import { create } from "zustand";
import type { Node, Link, Network } from "../Interface/INetwork";

const randomIP = () => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(
    Math.random() * 255
  )}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const generateGraphData = () => {
  const nodes: Node[] = [];
  const links: Link[] = [];

  const switches: Node[] = Array.from({ length: 500 }, (_, i) => ({
    id: `switch-${i}`,
    name: `Switch ${i + 1}`,
    type: "switch",
    ip: randomIP(),
    color: "#2e7d32",
    val: 15,
  }));

  const hosts: Node[] = Array.from({ length: 1000 }, (_, i) => ({
    id: `host-${i}`,
    name: `Host ${i + 1}`,
    type: "host",
    ip: randomIP(),
    color: "#ed6c02",
    val: 10,
  }));

  nodes.push(...switches, ...hosts);

  hosts.forEach((host) => {
    const totalHosts = Math.floor(Math.random() * 5) + 1;
    const availableSwitches = [...switches];
    for (let i = 0; i < totalHosts; i++) {
      if (availableSwitches.length === 0) {
        break;
      }
      const randomIndex = Math.floor(Math.random() * availableSwitches.length);
      links.push({
        source: host.id,
        target: availableSwitches[randomIndex].id,
      });
      availableSwitches.splice(randomIndex, 1);
    }
  });

  switches.forEach((switchswitch) => {
    const totalSwitches = Math.floor(Math.random() * 5) + 1;
    const availableSwitches = [...switches];
    for (let j = 0; j < totalSwitches; j++) {
      if (availableSwitches.length === 0) {
        break;
      }
      const r = Math.floor(Math.random() * availableSwitches.length);
      links.push({
        source: switchswitch.id,
        target: availableSwitches[r].id,
      });
      availableSwitches.splice(r, 1);
    }
  });

  return { nodes, links };
};

const handleNodeSelection = (state: Network, nodeId: string, isShiftKey: boolean) => {
  const newSelectedNodes = new Set(state.selectedNodes);
  const node = state.graphData.nodes.find(n => n.id === nodeId);
  
  if (!isShiftKey) {
    newSelectedNodes.clear();
    newSelectedNodes.add(nodeId);
    return { 
      selectedNode: node || null,
      selectedNodes: newSelectedNodes 
    };
  } else {
    if (newSelectedNodes.has(nodeId)) {
      newSelectedNodes.delete(nodeId);
      if (state.selectedNode?.id === nodeId) {
        const remainingNodes = Array.from(newSelectedNodes);
        return { 
          selectedNode: remainingNodes.length > 0 ? state.graphData.nodes.find(n => n.id === remainingNodes[0]) || null : null,
          selectedNodes: newSelectedNodes 
        };
      }
    } else {
      newSelectedNodes.add(nodeId);
      return { 
        selectedNode: node || null,
        selectedNodes: newSelectedNodes 
      };
    }
    return { selectedNodes: newSelectedNodes };
  }
};

const handleClearSelection = () => ({
  selectedNode: null,
  selectedNodes: new Set<string>()
});

export const useNetworkStore = create<Network>((set) => ({
  graphData: generateGraphData(),
  selectedNode: null,
  selectedNodes: new Set<string>(),
  setSelectedNode: (node) => set({ selectedNode: node }),
  toggleNodeSelection: (nodeId, isShiftKey) => set((state) => handleNodeSelection(state, nodeId, isShiftKey)),
  clearSelection: () => set(handleClearSelection),
}));
