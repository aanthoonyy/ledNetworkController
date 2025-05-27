export type NodeState = "on" | "off" | "blinking" | "pulse";
export type NodeColor = string;

export const colorOptions = [
  { value: "#2196f3", label: "Blue" },
  { value: "#4caf50", label: "Green" },
  { value: "#f44336", label: "Red" },
];

export interface NodeInfoPanelProps {
  node: Node | null;
  onClose: () => void;
}
