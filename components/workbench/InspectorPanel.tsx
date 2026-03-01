"use client";

import type { WorkbenchTask } from "./WorkbenchView";

export function InspectorPanel({ task }: { task?: WorkbenchTask }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="text-sm font-semibold text-white">Inspector</div>
        <div className="text-xs text-white/50">Project + tickets + files + tasks</div>
      </div>

      <div className="grid gap-3 p-4 text-sm">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs font-semibold text-white/70">Summary</div>
          <div className="mt-2 text-white/75">
            {task ? (
              <>
                <div className="font-semibold text-white">{task.title}</div>
                <div className="text-xs text-white/50">{task.client}</div>
                <div className="mt-2 text-xs text-white/60">
                  Assignee: <span className="text-white/80">{task.assignee}</span> • Due{" "}
                  <span className="text-white/80">{task.dueDate}</span>
                </div>
              </>
            ) : (
              <div className="text-white/60">Select an item to inspect.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs font-semibold text-white/70">Open tickets</div>
          <div className="mt-2 space-y-2 text-white/75">
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
              Network protocol issue <span className="text-white/40">• 3 days</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
              Billing clarification <span className="text-white/40">• 6 days</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs font-semibold text-white/70">Files</div>
          <div className="mt-2 space-y-2 text-white/75">
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">Contract.pdf</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">Alpha_Plan.docx</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">Design.png</div>
          </div>
          <button className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10">
            Add file
          </button>
        </div>
      </div>
    </div>
  );
}