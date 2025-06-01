import type {
  NodeState,
  LightControlMessage,
} from "../Interface/ILightControl";

class LightControlStore {
  private ws: WebSocket | null = null;
  private nodeStates: Record<string, NodeState> = {};
  private nodeSubscribers: Map<
    string,
    Set<(state: "on" | "off", color: string) => void>
  > = new Map();
  public onNodeUpdate:
    | ((nodeId: string, state: "on" | "off", color: string) => void)
    | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket("ws://localhost:8080/ws");

    this.ws.onopen = () => {
      console.log("Connected to server");
      this.ws?.send(JSON.stringify({ type: "request_states" }));
      this.logNodeStates();
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connect(), 5000);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "arduino_state") {
          this.updateNodeState(message.nodeId, message.state, message.color);
          this.logNodeStates();
          if (this.onNodeUpdate) {
            this.onNodeUpdate(message.nodeId, message.state, message.color);
          }
        } else if (message.type === "all_states") {
          const states = message.states as NodeState[];
          states.forEach((state) => {
            this.updateNodeState(state.nodeId, state.state, state.color);
            if (this.onNodeUpdate) {
              this.onNodeUpdate(state.nodeId, state.state, state.color);
            }
          });
          this.logNodeStates();
        }
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    };
  }

  private updateNodeState(nodeId: string, state: "on" | "off", color: string) {
    this.nodeStates[nodeId] = {
      nodeId,
      state,
      color,
      lastUpdated: new Date().toLocaleTimeString(),
    };

    const subscribers = this.nodeSubscribers.get(nodeId);
    if (subscribers) {
      subscribers.forEach((callback) => callback(state, color));
    }

    if (this.onNodeUpdate) {
      this.onNodeUpdate(nodeId, state, color);
    }
  }

  public logNodeStates(): void {
    const states = Object.values(this.nodeStates);
    if (states.length === 0) {
      console.log("No nodes have reported their state yet");
      return;
    }

    console.log("=== Current Node States ===");
    states.forEach((node) => {
      console.log(
        `  ${node.nodeId}: state=${node.state}, color=${node.color} (updated: ${node.lastUpdated})`
      );
    });
    console.log("=========================");
  }

  public getNodesArray(): [string, "on" | "off", string, string][] {
    return Object.values(this.nodeStates).map((node) => [
      node.nodeId,
      node.state,
      node.color,
      node.lastUpdated,
    ]);
  }

  public sendMessage(message: LightControlMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  public subscribeToNode(
    nodeId: string,
    callback: (state: "on" | "off", color: string) => void
  ) {
    if (!this.nodeSubscribers.has(nodeId)) {
      this.nodeSubscribers.set(nodeId, new Set());
    }
    this.nodeSubscribers.get(nodeId)!.add(callback);

    // Immediately notify with current state
    const currentState = this.nodeStates[nodeId];
    if (currentState) {
      callback(currentState.state, currentState.color);
    }

    return () => {
      const subscribers = this.nodeSubscribers.get(nodeId);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.nodeSubscribers.delete(nodeId);
        }
      }
    };
  }

  public sendNodeCommand(
    nodeId: string,
    command: "on" | "off" | "blink" | "pulse",
    color: "red" | "green" | "blue"
  ) {
    const message: LightControlMessage = {
      type: "light_control",
      nodeId,
      command,
      color,
    };
    this.sendMessage(message);
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

const lightControlStore = new LightControlStore();
export default lightControlStore;
