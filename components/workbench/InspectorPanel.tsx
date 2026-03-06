"use client";

import type { WorkbenchTaskDTO } from "./types";

function toneForStatus(status: WorkbenchTaskDTO["status"]) {
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

export function InspectorPanel({ task }: { task?: WorkbenchTaskDTO }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-4">
        <div className="text-sm font-semibold text-white">Inspector</div>
        <div className="mt-1 text-xs text-white/45">
          Project + tickets + files + tasks
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 text-sm font-semibold text-white">Summary</div>

          {task ? (
            <>
              <div className="text-base font-semibold text-white">
                {task.title}
              </div>

              <div className="mt-1 text-sm text-white/55">{task.client}</div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneForStatus(
                    task.status
                  )}`}
                >
                  {task.status}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/75">
                  Priority: {task.priority}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-white/70">
                <div>
                  <span className="text-white/45">Assignee:</span> {task.assignee}
                </div>
                <div>
                  <span className="text-white/45">Due:</span> {task.dueDate ?? "—"}
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-white/45">
              Select an item to inspect.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 text-sm font-semibold text-white">
            Open tickets
          </div>

          <div className="space-y-2 text-sm text-white/65">
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              Network protocol issue • 3 days
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              Billing clarification • 6 days
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 text-sm font-semibold text-white">Files</div>

          <div className="space-y-2 text-sm text-white/65">
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              Contract.pdf
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              Alpha_Plan.docx
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              Design.png
            </div>
          </div>

          <button
            type="button"
            className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Add file
          </button>
        </div>
      </div>
    </div>
  );
}