import type { NodeState } from "../Interface/ILightControl";

type NodeStateCallback = (state: "on" | "off", color: string) => void;

export class NodeSubscriptions {
  private subscribers: Map<string, Set<NodeStateCallback>> = new Map();
  private nodeStates: Record<string, NodeState> = {};

  public subscribe(nodeId: string, callback: NodeStateCallback) {
    if (!this.subscribers.has(nodeId)) {
      this.subscribers.set(nodeId, new Set());
    }
    this.subscribers.get(nodeId)!.add(callback);

    const currentState = this.nodeStates[nodeId];
    if (currentState) {
      callback(currentState.state, currentState.color);
    }

    return () => {
      const subscribers = this.subscribers.get(nodeId);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(nodeId);
        }
      }
    };
  }

  public updateNodeState(nodeId: string, state: "on" | "off", color: string) {
    this.nodeStates[nodeId] = {
      nodeId,
      state,
      color,
      lastUpdated: new Date().toLocaleTimeString(),
    };

    const subscribers = this.subscribers.get(nodeId);
    if (subscribers) {
      subscribers.forEach((callback) => callback(state, color));
    }
  }

  public getNodeState(
    nodeId: string
  ): { state: "on" | "off"; color: string } | null {
    const nodeState = this.nodeStates[nodeId];
    return nodeState
      ? { state: nodeState.state, color: nodeState.color }
      : null;
  }
}

export const nodeSubscriptions = new NodeSubscriptions();
