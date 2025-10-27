import ReactFlow, { Background, Controls } from "react-flow-renderer";
import data from "./mock_family_tree.json";

const createNodesAndEdges = (data, parentId = null, level = 0) => {
  const nodes = [];
  const edges = [];

  const id = `${data.name}-${level}`;
  nodes.push({
    id,
    data: { label: data.name },
    position: { x: Math.random() * 400, y: level * 100 },
  });

  if (parentId) {
    edges.push({ id: `e${parentId}-${id}`, source: parentId, target: id });
  }

  if (data.children) {
    data.children.forEach((child) => {
      const { nodes: childNodes, edges: childEdges } = createNodesAndEdges(child, id, level + 1);
      nodes.push(...childNodes);
      edges.push(...childEdges);
    });
  }

  return { nodes, edges };
};

const Tree = () => {
  const { nodes, edges } = createNodesAndEdges(data);

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Tree;