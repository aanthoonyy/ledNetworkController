import type { Node } from "./INetwork";

export const colorOptions = [
  { value: "#2196f3", label: "Blue" },
  { value: "#4caf50", label: "Green" },
  { value: "#f44336", label: "Red" },
];

export type NodeColor = string;
export type NodeState = "on" | "off" | "blinking" | "pulse";

export interface NodeInfoPanelProps {
  node: Node | null;
  onClose: () => void;
}
