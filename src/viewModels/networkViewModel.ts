import { useCallback, useEffect } from "react";
import { useNetworkStore } from "../store/networkStore";
import type { Node } from "../Interface/INetwork";

export const useNetworkViewModel = () => {
  const {
    graphData,
    selectedNode,
    selectedNodes,
    toggleNodeSelection,
    clearSelection,
  } = useNetworkStore();

  useEffect(() => {
    const selectedNodesList = graphData.nodes.filter((node) =>
      selectedNodes.has(node.id)
    );
    console.log("Selected Nodes:", selectedNodesList);
  }, [selectedNodes, graphData.nodes]);

  const handleNodeClick = useCallback(
    (node: Node, event: MouseEvent) => {
      toggleNodeSelection(node.id, event.shiftKey);
    },
    [toggleNodeSelection]
  );

  const paintNode = useCallback(
    (node: Node, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.name;
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(
        (n) => n + fontSize * 0.2
      );

      ctx.beginPath();
      ctx.arc(node.x!, node.y!, 20, 0, 2 * Math.PI);

      const isPrimarySelected = selectedNode?.id === node.id;
      ctx.fillStyle = node.color || "#838383";
      ctx.fill();

      if (isPrimarySelected) {
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, 22, 0, 2 * Math.PI);
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillRect(
        node.x! - bckgDimensions[0] / 2,
        node.y! + 25,
        bckgDimensions[0],
        bckgDimensions[1]
      );

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000";
      ctx.fillText(label, node.x!, node.y! + 25 + fontSize / 2);
    },
    [selectedNode]
  );

  return {
    graphData,
    selectedNode,
    selectedNodes,
    handleNodeClick,
    paintNode,
    clearSelection,
  };
};
