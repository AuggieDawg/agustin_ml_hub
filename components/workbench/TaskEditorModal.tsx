"use client";

import { useEffect, useState } from "react";

export type WorkbenchTaskStatus = "Open" | "InProgress" | "Review" | "Completed" | "Overdue";
export type WorkbenchTaskPriority = "Low" | "Medium" | "High";

export type WorkbenchTaskDTO = {
  id: string;
  title: string;
  client: string;
  dueDate: string | null;
  assignee: string;
  status: WorkbenchTaskStatus;
  priority: WorkbenchTaskPriority;
};

const STATUSES: WorkbenchTaskStatus[] = ["Open", "InProgress", "Review", "Completed", "Overdue"];
const PRIORITIES: WorkbenchTaskPriority[] = ["Low", "Medium", "High"];

export function TaskEditorModal({
  open,
  mode,
  task,
  onClose,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  mode: "create" | "edit";
  task?: WorkbenchTaskDTO;
  onClose: () => void;
  onCreate: (payload: Omit<WorkbenchTaskDTO, "id">) => Promise<void>;
  onUpdate: (taskId: string, patch: Partial<Omit<WorkbenchTaskDTO, "id">>) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState<WorkbenchTaskStatus>("Open");
  const [priority, setPriority] = useState<WorkbenchTaskPriority>("Medium");
  const [dueDate, setDueDate] = useState<string>("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);

    if (mode === "edit" && task) {
      setTitle(task.title);
      setClient(task.client);
      setAssignee(task.assignee);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ?? "");
    } else {
      setTitle("");
      setClient("");
      setAssignee("");
      setStatus("Open");
      setPriority("Medium");
      setDueDate("");
    }
  }, [open, mode, task]);

  if (!open) return null;

  const save = async () => {
    setErr(null);

    if (!title.trim()) return setErr("Title is required.");
    if (!client.trim()) return setErr("Client is required.");
    if (!assignee.trim()) return setErr("Assignee is required.");

    setBusy(true);
    try {
      if (mode === "create") {
        await onCreate({
          title: title.trim(),
          client: client.trim(),
          assignee: assignee.trim(),
          status,
          priority,
          dueDate: dueDate ? dueDate : null,
        });
      } else if (task) {
        await onUpdate(task.id, {
          title: title.trim(),
          client: client.trim(),
          assignee: assignee.trim(),
          status,
          priority,
          dueDate: dueDate ? dueDate : null,
        });
      }
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0A0E16] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="text-sm font-semibold text-white">
            {mode === "create" ? "Create Workbench Task" : "Edit Workbench Task"}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="grid gap-3 p-4">
          {err && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {err}
            </div>
          )}

          <div className="grid gap-2">
            <label className="text-xs text-white/60">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
              placeholder="e.g., Finalize proposal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className="text-xs text-white/60">Client</label>
              <input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                placeholder="e.g., Acme Corp"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-white/60">Assignee</label>
              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                placeholder="e.g., You"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <label className="text-xs text-white/60">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="rounded-xl border border-white/10 bg-[#070A10] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-white/60">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="rounded-xl border border-white/10 bg-[#070A10] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-white/60">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              disabled={busy}
              onClick={save}
              className="rounded-xl bg-sky-500/90 px-4 py-2 text-sm font-semibold text-black hover:bg-sky-400 disabled:opacity-50"
            >
              {busy ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}