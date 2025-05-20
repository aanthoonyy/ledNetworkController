import ForceGraph2D from "react-force-graph-2d";
import { useNetworkViewModel } from "../viewModels/networkViewModel";
import { NodeInfoPanel } from "./NodeInfoPanel";
import { useRef, useEffect } from "react";
import * as d3 from "d3-force";
import type { Node } from "../Interface/INetwork";

const NetworkTopology = () => {
  const {
    graphData,
    selectedNode,
    handleNodeClick,
    paintNode,
    clearSelection,
  } = useNetworkViewModel();
  const graphRef = useRef<any>(null);

  const handleGraphNodeClick = (node: Node, event: MouseEvent) => {
    handleNodeClick(node, event);
  };

  const handleBackgroundClick = () => {
    clearSelection();
  };

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force("charge", d3.forceManyBody().strength(-300));
      graphRef.current.d3Force("link", d3.forceLink().distance(300));
      graphRef.current.d3Force("center", d3.forceCenter().strength(0.5));
      graphRef.current.d3Force("collision", d3.forceCollide().radius(50));
    }

    const timer = setTimeout(() => {
      if (graphRef.current) {
        graphRef.current.d3Force("charge", null);
        graphRef.current.d3Force("link", null);
        graphRef.current.d3Force("center", null);
        graphRef.current.d3Force("collision", null);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeCanvasObject={paintNode}
        linkWidth={2}
        linkColor={() => "#999"}
        nodeRelSize={6}
        cooldownTicks={500}
        onNodeClick={handleGraphNodeClick}
        onBackgroundClick={handleBackgroundClick}
        nodeLabel={(node) => `${node.name}\nType: ${node.type}\nIP: ${node.ip}`}
        onEngineStop={() => {
          console.log("Force layout simulation stopped");
        }}
      />
      <NodeInfoPanel node={selectedNode} onClose={() => clearSelection()} />
    </div>
  );
};

export default NetworkTopology;
