"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

import type {
  WorkbenchTaskDTO,
  WorkbenchTaskLinkDTO,
  WorkbenchTaskStatus,
} from "./types";

type TaskNodeData = {
  task: WorkbenchTaskDTO;
  selected: boolean;
  onSelectTask: (taskId: string) => void;
};

const STATUS_THEME: Record<
  WorkbenchTaskStatus,
  {
    container: string;
    pill: string;
    miniMap: string;
  }
> = {
  Open: {
    container: "border-white/10 bg-white/5 text-white/90",
    pill: "border-white/15 bg-white/10 text-white/80",
    miniMap: "rgba(255,255,255,0.70)",
  },
  InProgress: {
    container: "border-sky-500/35 bg-sky-500/15 text-sky-50",
    pill: "border-sky-400/30 bg-sky-400/20 text-sky-100",
    miniMap: "rgba(56,189,248,0.90)",
  },
  Review: {
    container: "border-amber-500/35 bg-amber-500/15 text-amber-50",
    pill: "border-amber-400/30 bg-amber-400/20 text-amber-100",
    miniMap: "rgba(245,158,11,0.90)",
  },
  Completed: {
    container: "border-emerald-500/35 bg-emerald-500/18 text-emerald-50",
    pill: "border-emerald-400/30 bg-emerald-400/20 text-emerald-100",
    miniMap: "rgba(16,185,129,0.92)",
  },
  Overdue: {
    container: "border-rose-500/35 bg-rose-500/15 text-rose-50",
    pill: "border-rose-400/30 bg-rose-400/20 text-rose-100",
    miniMap: "rgba(244,63,94,0.92)",
  },
};

const EDGE_STROKE = "rgba(255,255,255,0.24)";
const SELECTED_EDGE_STROKE = "rgba(125,211,252,0.72)";

function TaskNode({ data }: NodeProps<TaskNodeData>) {
  const theme = STATUS_THEME[data.task.status];

  return (
    <div
      onClick={() => data.onSelectTask(data.task.id)}
      className={[
        "relative w-[190px] cursor-pointer rounded-xl border px-3 py-2 text-left shadow-lg backdrop-blur-sm transition",
        theme.container,
        data.selected
          ? "ring-2 ring-sky-300/70 shadow-[0_0_0_1px_rgba(125,211,252,0.35)]"
          : "hover:-translate-y-0.5 hover:shadow-xl",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border !border-white/20 !bg-white/80"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border !border-white/20 !bg-white/80"
      />

      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="min-h-[32px] overflow-hidden text-[13px] font-semibold leading-4 text-white">
          {data.task.title}
        </div>
        <span
          className={[
            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            theme.pill,
          ].join(" ")}
        >
          {data.task.status}
        </span>
      </div>

      <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
        {data.task.client}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-white/70">
        <span className="truncate">{data.task.assignee}</span>
        <span>{data.task.dueDate ?? "No due"}</span>
      </div>
    </div>
  );
}

const nodeTypes = {
  taskNode: TaskNode,
};

export function RelationshipMap({
  tasks,
  links,
  selectedTaskId,
  onSelectTask,
  onMoveTask,
  onCreateLink,
  onDeleteLink,
}: {
  tasks: WorkbenchTaskDTO[];
  links: WorkbenchTaskLinkDTO[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
  onMoveTask: (taskId: string, mapX: number, mapY: number) => Promise<void>;
  onCreateLink: (sourceTaskId: string, targetTaskId: string) => Promise<void>;
  onDeleteLink: (linkId: string) => Promise<void>;
}) {
  const mappedNodes = useMemo<Node<TaskNodeData>[]>(() => {
    return tasks.map((task) => ({
      id: task.id,
      type: "taskNode",
      position: { x: task.mapX, y: task.mapY },
      data: {
        task,
        selected: task.id === selectedTaskId,
        onSelectTask,
      },
    }));
  }, [tasks, selectedTaskId, onSelectTask]);

  const mappedEdges = useMemo<Edge[]>(() => {
    return links.map((link) => {
      const touchesSelected =
        link.sourceTaskId === selectedTaskId || link.targetTaskId === selectedTaskId;

      return {
        id: link.id,
        source: link.sourceTaskId,
        target: link.targetTaskId,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: touchesSelected ? SELECTED_EDGE_STROKE : EDGE_STROKE,
        },
        style: {
          stroke: touchesSelected ? SELECTED_EDGE_STROKE : EDGE_STROKE,
          strokeWidth: touchesSelected ? 1.9 : 1.4,
        },
      };
    });
  }, [links, selectedTaskId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(mappedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mappedEdges);

  useEffect(() => {
    setNodes(mappedNodes);
  }, [mappedNodes, setNodes]);

  useEffect(() => {
    setEdges(mappedEdges);
  }, [mappedEdges, setEdges]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) return;

      const duplicate = links.some(
        (link) =>
          link.sourceTaskId === connection.source &&
          link.targetTaskId === connection.target
      );

      if (duplicate) return;

      void onCreateLink(connection.source, connection.target);
    },
    [links, onCreateLink]
  );

  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node<TaskNodeData>) => {
      void onMoveTask(node.id, node.position.x, node.position.y);
    },
    [onMoveTask]
  );

  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      event.stopPropagation();
      void onDeleteLink(edge.id);
    },
    [onDeleteLink]
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-black/30">
      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-[11px] text-white/65 backdrop-blur">
        Drag boxes to arrange them. Drag from the right dot of one box to the left dot of another
        to create a link. Click a line to delete it.
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={(_, node) => onSelectTask(node.id)}
        onNodeDragStop={handleNodeDragStop}
        onEdgeClick={handleEdgeClick}
        fitView
        fitViewOptions={{ padding: 0.24 }}
        minZoom={0.25}
        maxZoom={2.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={22} size={1} color="rgba(255,255,255,0.06)" />
        <MiniMap
          style={{
            width: 128,
            height: 82,
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
          }}
          nodeColor={(node) => {
            const taskStatus = (node.data as TaskNodeData | undefined)?.task?.status;
            return taskStatus ? STATUS_THEME[taskStatus].miniMap : "rgba(255,255,255,0.40)";
          }}
          maskColor="rgba(0,0,0,0.68)"
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}