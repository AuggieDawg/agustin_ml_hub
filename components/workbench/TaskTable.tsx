"use client";

import type { KeyboardEvent } from "react";
import type { WorkbenchTaskDTO } from "./types";

function formatDueDate(value: string | null) {
  if (!value) return "—";

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function statusClasses(status: WorkbenchTaskDTO["status"]) {
  switch (status) {
    case "Completed":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "InProgress":
      return "border-sky-500/30 bg-sky-500/10 text-sky-200";
    case "Review":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "Overdue":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    default:
      return "border-white/10 bg-white/5 text-white/75";
  }
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
  onSelect: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}) {
  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    taskId: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(taskId);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_0.9fr] gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
        <div>Task</div>
        <div>Client</div>
        <div>Due</div>
        <div>Assignee</div>
        <div>Status</div>
        <div>Actions</div>
      </div>

      <div className="divide-y divide-white/10">
        {tasks.length === 0 ? (
          <div className="px-4 py-8 text-sm text-white/45">No tasks found.</div>
        ) : (
          tasks.map((t) => {
            const active = selectedId === t.id;

            return (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(t.id)}
                onKeyDown={(event) => handleRowKeyDown(event, t.id)}
                className={[
                  "group grid w-full grid-cols-[2fr_1.2fr_1fr_1fr_1fr_0.9fr] gap-3 px-4 py-4 text-left transition outline-none",
                  active
                    ? "bg-sky-300/10"
                    : "bg-transparent hover:bg-white/[0.03]",
                  "focus-visible:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-sky-300/30",
                  "cursor-pointer",
                ].join(" ")}
                aria-pressed={active}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {t.title}
                  </div>
                  <div className="mt-1 text-xs text-white/45">
                    Priority: {t.priority}
                  </div>
                </div>

                <div className="min-w-0 text-sm text-white/75">{t.client}</div>

                <div className="text-sm text-white/75">
                  {formatDueDate(t.dueDate)}
                </div>

                <div className="min-w-0 text-sm text-white/75">{t.assignee}</div>

                <div>
                  <span
                    className={[
                      "inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold",
                      statusClasses(t.status),
                    ].join(" ")}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(t.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(t.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/8 px-2.5 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/14"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}