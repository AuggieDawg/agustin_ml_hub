"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Plus, SlidersHorizontal, LayoutGrid, Network } from "lucide-react";

import { WorkbenchTabs } from "./WorkbenchTabs";
import { TaskTable } from "./TaskTable";
import { TaskDetail } from "./TaskDetail";
import { RelationshipMap } from "./RelationshipMap";
import { InspectorPanel } from "./InspectorPanel";
import { TaskEditorModal } from "./TaskEditorModal";
import type { WorkbenchTaskDTO, WorkbenchTaskLinkDTO } from "./types";

type WorkbenchTaskUpsert = Omit<WorkbenchTaskDTO, "id" | "mapX" | "mapY">;

type TasksResponse = {
  tasks: any[];
  links: any[];
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `Request failed: ${res.status}`);
  return data as T;
}

function mapTask(task: any): WorkbenchTaskDTO {
  return {
    id: task.id,
    title: task.title,
    client: task.client,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : null,
    assignee: task.assignee,
    status: task.status,
    priority: task.priority,
    mapX: typeof task.mapX === "number" ? task.mapX : 40,
    mapY: typeof task.mapY === "number" ? task.mapY : 40,
  };
}

function mapLink(link: any): WorkbenchTaskLinkDTO {
  return {
    id: link.id,
    sourceTaskId: link.sourceTaskId,
    targetTaskId: link.targetTaskId,
  };
}

export default function WorkbenchView() {
  const [loading, setLoading] = useState(true);
  const [tasksRaw, setTasksRaw] = useState<WorkbenchTaskDTO[]>([]);
  const [linksRaw, setLinksRaw] = useState<WorkbenchTaskLinkDTO[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkbenchTaskDTO["status"] | "All">("All");
  const [selectedId, setSelectedId] = useState<string>("");
  const [rightTab, setRightTab] = useState<"Map" | "Timeline" | "Quick">("Map");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");

  const loadWorkbench = useCallback(async () => {
    const { tasks, links } = await api<TasksResponse>("/api/workbench/tasks");
    const mappedTasks = tasks.map(mapTask);
    const mappedLinks = links.map(mapLink);

    setTasksRaw(mappedTasks);
    setLinksRaw(mappedLinks);
    setSelectedId((prev) => prev || mappedTasks[0]?.id || "");
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const { tasks, links } = await api<TasksResponse>("/api/workbench/tasks");

        if (!mounted) return;

        const mappedTasks = tasks.map(mapTask);
        const mappedLinks = links.map(mapLink);

        setTasksRaw(mappedTasks);
        setLinksRaw(mappedLinks);
        setSelectedId((prev) => prev || mappedTasks[0]?.id || "");
      } catch (error) {
        console.error("Failed to load workbench", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const selected = useMemo(
    () => tasksRaw.find((t) => t.id === selectedId) ?? tasksRaw[0],
    [tasksRaw, selectedId]
  );

  const tasks = useMemo(() => {
    return tasksRaw
      .filter((t) => (statusFilter === "All" ? true : t.status === statusFilter))
      .filter((t) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.client.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q)
        );
      });
  }, [tasksRaw, query, statusFilter]);

  const visibleTaskIds = useMemo(() => new Set(tasks.map((task) => task.id)), [tasks]);

  const visibleLinks = useMemo(() => {
    return linksRaw.filter(
      (link) =>
        visibleTaskIds.has(link.sourceTaskId) && visibleTaskIds.has(link.targetTaskId)
    );
  }, [linksRaw, visibleTaskIds]);

  const openCreate = () => {
    setEditorMode("create");
    setEditorOpen(true);
  };

  const openEdit = (taskId: string) => {
    setSelectedId(taskId);
    setEditorMode("edit");
    setEditorOpen(true);
  };

  const createTask = async (payload: WorkbenchTaskUpsert) => {
    const { task } = await api<{ task: any }>("/api/workbench/tasks", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        dueDate: payload.dueDate ? payload.dueDate : null,
      }),
    });

    const mapped = mapTask(task);

    setTasksRaw((prev) => [mapped, ...prev]);
    setSelectedId(mapped.id);
  };

  const updateTask = async (taskId: string, patch: Partial<WorkbenchTaskUpsert>) => {
    const { task } = await api<{ task: any }>(`/api/workbench/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...patch,
        dueDate: patch.dueDate !== undefined ? (patch.dueDate ? patch.dueDate : null) : undefined,
      }),
    });

    const mapped = mapTask(task);

    setTasksRaw((prev) =>
      prev.map((existing) => (existing.id === taskId ? mapped : existing))
    );
  };

  const updateTaskPosition = async (taskId: string, mapX: number, mapY: number) => {
    setTasksRaw((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, mapX, mapY } : task))
    );

    try {
      await api<{ task: any }>(`/api/workbench/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ mapX, mapY }),
      });
    } catch (error) {
      console.error("Failed to persist task position", error);
      await loadWorkbench();
    }
  };

  const createLink = async (sourceTaskId: string, targetTaskId: string) => {
    const { link } = await api<{ link: any }>("/api/workbench/task-links", {
      method: "POST",
      body: JSON.stringify({ sourceTaskId, targetTaskId }),
    });

    const mapped = mapLink(link);

    setLinksRaw((prev) => {
      const exists = prev.some(
        (existing) =>
          existing.id === mapped.id ||
          (existing.sourceTaskId === mapped.sourceTaskId &&
            existing.targetTaskId === mapped.targetTaskId)
      );

      return exists ? prev : [...prev, mapped];
    });
  };

  const deleteLink = async (linkId: string) => {
    const previous = linksRaw;
    setLinksRaw((prev) => prev.filter((link) => link.id !== linkId));

    try {
      await api(`/api/workbench/task-links/${linkId}`, { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete link", error);
      setLinksRaw(previous);
    }
  };

  const deleteTask = async (taskId: string) => {
    await api(`/api/workbench/tasks/${taskId}`, { method: "DELETE" });

    setTasksRaw((prev) => prev.filter((task) => task.id !== taskId));
    setLinksRaw((prev) =>
      prev.filter(
        (link) => link.sourceTaskId !== taskId && link.targetTaskId !== taskId
      )
    );
    setSelectedId((prev) => (prev === taskId ? "" : prev));
  };

  return (
    <div className="h-full w-full bg-[#070A10] text-zinc-100">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#070A10]/70 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Network className="h-4 w-4" />
            <span className="font-semibold text-white">Workbench</span>
            <span className="text-white/40">/</span>
            <span className="text-white/60">Split + Map</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, clients, assignees..."
                className="w-[340px] rounded-xl border border-white/10 bg-white/5 px-9 py-2 text-sm outline-none placeholder:text-white/30 focus:border-white/20"
              />
            </div>

            <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>

            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500/90 px-3 py-2 text-sm font-semibold text-black hover:bg-sky-400"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
          {(["All", "Open", "InProgress", "Review", "Completed", "Overdue"] as const).map((s) => {
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={[
                  "rounded-full px-3 py-1 text-xs transition",
                  active
                    ? "bg-white/10 text-white border border-white/15"
                    : "bg-transparent text-white/60 border border-white/10 hover:bg-white/5",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid h-[calc(100%-110px)] grid-cols-12 gap-3 p-4">
        <div className="col-span-12 flex min-h-0 flex-col gap-3 lg:col-span-7 xl:col-span-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <LayoutGrid className="h-4 w-4" />
                <span className="font-semibold text-white">Workbench Tasks</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60">{loading ? "Loading..." : `${tasks.length} shown`}</span>
              </div>
              <div className="text-xs text-white/50">Table • Actions on hover</div>
            </div>

            <div className="min-h-0">
              <TaskTable
                tasks={tasks}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id)}
                onEdit={openEdit}
                onDelete={deleteTask}
              />
            </div>
          </div>

          <div className="min-h-0 rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <TaskDetail task={selected} onEdit={() => selected && openEdit(selected.id)} />
          </div>
        </div>

        <div className="col-span-12 flex min-h-0 flex-col gap-3 lg:col-span-5 xl:col-span-4">
          <div className="min-h-0 rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <WorkbenchTabs value={rightTab} onChange={setRightTab} />
            <div className="h-[520px] p-3">
              {rightTab === "Map" ? (
                <RelationshipMap
                  tasks={tasks}
                  links={visibleLinks}
                  selectedTaskId={selected?.id ?? ""}
                  onSelectTask={setSelectedId}
                  onMoveTask={updateTaskPosition}
                  onCreateLink={createLink}
                  onDeleteLink={deleteLink}
                />
              ) : rightTab === "Timeline" ? (
                <div className="h-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                  Timeline placeholder.
                </div>
              ) : (
                <div className="h-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                  Quick placeholder.
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0 rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <InspectorPanel task={selected} />
          </div>
        </div>
      </div>

      <TaskEditorModal
        open={editorOpen}
        mode={editorMode}
        task={editorMode === "edit" ? selected : undefined}
        onClose={() => setEditorOpen(false)}
        onCreate={createTask}
        onUpdate={updateTask}
      />
    </div>
  );
}