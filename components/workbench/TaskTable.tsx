"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { WorkbenchTaskDTO } from "./types";

function StatusPill({ status }: { status: WorkbenchTaskDTO["status"] }) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold";

  const map: Record<WorkbenchTaskDTO["status"], string> = {
    Open: "border-white/10 bg-white/5 text-white/70",
    InProgress: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    Review: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    Completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    Overdue: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  };

  return <span className={`${base} ${map[status]}`}>{status}</span>;
}

export function TaskTable({
  tasks,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: {
  tasks: WorkbenchTaskDTO[];
  selectedId: string;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_0.9fr] gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/45">
        <div>Task</div>
        <div>Client</div>
        <div>Due</div>
        <div>Assignee</div>
        <div>Status</div>
        <div>Actions</div>
      </div>

      <div className="divide-y divide-white/5">
        {tasks.map((t) => {
          const active = t.id === selectedId;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={[
                "group grid w-full grid-cols-[2fr_1.2fr_1fr_1fr_1fr_0.9fr] gap-3 px-4 py-4 text-left transition",
                active ? "bg-white/10" : "hover:bg-white/5",
              ].join(" ")}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {t.title}
                </div>
                <div className="mt-1 text-xs text-white/45">
                  Priority: {t.priority}
                </div>
              </div>

              <div className="truncate text-sm text-white/75">{t.client}</div>
              <div className="text-sm text-white/70">{t.dueDate ?? "—"}</div>
              <div className="truncate text-sm text-white/70">{t.assignee}</div>
              <div>
                <StatusPill status={t.status} />
              </div>

              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(t.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(t.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </button>
          );
        })}

        {tasks.length === 0 ? (
          <div className="px-4 py-8 text-sm text-white/45">
            No tasks match your filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}