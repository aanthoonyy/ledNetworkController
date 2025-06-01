import { useState, useEffect } from "react";
import type { Node } from "../Interface/INetwork";
import type { NodeState, NodeColor } from "../Interface/INodeInfo";
import { nodeSubscriptions } from "../store/NodeSubscriptions";
import lightControlStore from "../store/lightControlStore";

export const useNodeInfoViewModel = (node: Node | null) => {
  const [state, setState] = useState<NodeState>("on");
  const [color, setColor] = useState<NodeColor>("#2196f3");

  useEffect(() => {
    if (!node) return;

    return nodeSubscriptions.subscribe(node.id, (newState, newColor) => {
      setState(newState);
      setColor(newColor as NodeColor);
    });
  }, [node?.id]);

  const handleStateChange = (newValue: NodeState | null) => {
    if (!node || !newValue) return;

    setState(newValue);
    const command =
      newValue === "blinking"
        ? "blink"
        : newValue === "pulse"
        ? "pulse"
        : newValue;
    const colorName =
      color === "#2196f3" ? "blue" : color === "#4caf50" ? "green" : "red";

    lightControlStore.sendNodeCommand(node.id, command, colorName);
  };

  const handleColorChange = (newValue: string | null) => {
    if (!node || !newValue) return;

    setColor(newValue as NodeColor);
    const command =
      state === "blinking" ? "blink" : state === "pulse" ? "pulse" : state;
    const colorName =
      newValue === "#2196f3"
        ? "blue"
        : newValue === "#4caf50"
        ? "green"
        : "red";

    lightControlStore.sendNodeCommand(node.id, command, colorName);
  };

  return {
    state,
    color,
    handleStateChange,
    handleColorChange,
  };
};
