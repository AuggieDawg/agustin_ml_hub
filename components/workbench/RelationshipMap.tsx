"use client";

import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

export function RelationshipMap({ selectedTaskId }: { selectedTaskId: string }) {
  const initialNodes = useMemo<Node[]>(() => {
    return [
      {
        id: "client_acme",
        position: { x: 240, y: 180 },
        data: { label: "Acme Corporation" },
        style: {
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.92)",
          padding: 10,
          fontWeight: 800,
        },
      },
      {
        id: "proj_alpha",
        position: { x: 60, y: 40 },
        data: { label: "Alpha Project" },
        style: {
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.05)",
          color: "rgba(255,255,255,0.80)",
          padding: 10,
        },
      },
      {
        id: "ticket_241",
        position: { x: 460, y: 40 },
        data: { label: "Ticket #241 (SLA risk)" },
        style: {
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.05)",
          color: "rgba(255,255,255,0.80)",
          padding: 10,
        },
      },
      {
        id: "finance_burn",
        position: { x: 510, y: 330 },
        data: { label: "Finance Burn ($14,200)" },
        style: {
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.05)",
          color: "rgba(255,255,255,0.80)",
          padding: 10,
        },
      },
      {
        id: "task_selected",
        position: { x: 80, y: 330 },
        data: { label: `Selected Task: ${selectedTaskId || "—"}` },
        style: {
          borderRadius: 14,
          border: "1px solid rgba(80,160,255,0.28)",
          background: "rgba(80,160,255,0.12)",
          color: "rgba(207,224,255,0.96)",
          padding: 10,
          fontWeight: 700,
        },
      },
    ];
  }, [selectedTaskId]);

  const initialEdges = useMemo<Edge[]>(() => {
    const stroke = "rgba(255,255,255,0.18)";
    return [
      { id: "e1", source: "client_acme", target: "proj_alpha", style: { stroke } },
      { id: "e2", source: "client_acme", target: "ticket_241", style: { stroke } },
      { id: "e3", source: "client_acme", target: "finance_burn", style: { stroke } },
      { id: "e4", source: "client_acme", target: "task_selected", style: { stroke } },
    ];
  }, []);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-white/10 bg-black/30">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.25}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={22} size={1} color="rgba(255,255,255,0.06)" />
        <MiniMap nodeColor={() => "rgba(80,160,255,0.35)"} maskColor="rgba(0,0,0,0.65)" />
        <Controls />
      </ReactFlow>
    </div>
  );
}