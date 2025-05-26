import type { NodeState } from "../Interface/ILightControl";

class LightControlStore {
  private ws: WebSocket | null = null;
  private nodeStates: Record<string, NodeState> = {};
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
}

const lightControlStore = new LightControlStore();
export default lightControlStore;
