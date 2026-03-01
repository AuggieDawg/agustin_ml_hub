"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { WorkbenchTaskDTO } from "./TaskDetail";

function StatusPill({ status }: { status: WorkbenchTaskDTO["status"] }) {
  const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold";
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
    <div className="max-h-[340px] overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[#0A0E16] text-xs text-white/50">
          <tr className="border-b border-white/10">
            <th className="px-4 py-2 text-left font-medium">Task</th>
            <th className="px-4 py-2 text-left font-medium">Client</th>
            <th className="px-4 py-2 text-left font-medium">Due</th>
            <th className="px-4 py-2 text-left font-medium">Assignee</th>
            <th className="px-4 py-2 text-left font-medium">Status</th>
            <th className="px-4 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const active = t.id === selectedId;
            return (
              <tr
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={[
                  "group cursor-pointer border-b border-white/5 transition",
                  active ? "bg-white/10" : "hover:bg-white/5",
                ].join(" ")}
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-white/90">{t.title}</div>
                  <div className="text-xs text-white/45">Priority: {t.priority}</div>
                </td>
                <td className="px-4 py-3 text-white/70">{t.client}</td>
                <td className="px-4 py-3 text-white/70">{t.dueDate ?? "—"}</td>
                <td className="px-4 py-3 text-white/70">{t.assignee}</td>
                <td className="px-4 py-3">
                  <StatusPill status={t.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 opacity-0 transition group-hover:opacity-100">
                    <button
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
                </td>
              </tr>
            );
          })}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-white/50">
                No tasks match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}