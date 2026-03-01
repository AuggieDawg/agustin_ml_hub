"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil } from "lucide-react";

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

type WorkbenchCommentDTO = {
  id: string;
  body: string;
  createdAt: string;
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

export function TaskDetail({ task, onEdit }: { task?: WorkbenchTaskDTO; onEdit?: () => void }) {
  const [comments, setComments] = useState<WorkbenchCommentDTO[]>([]);
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!task?.id) return setComments([]);
      const { comments } = await api<{ comments: WorkbenchCommentDTO[] }>(
        `/api/workbench/tasks/${task.id}/comments`
      );
      if (mounted) setComments(comments);
    })();
    return () => {
      mounted = false;
    };
  }, [task?.id]);

  const addComment = async () => {
    if (!task?.id) return;
    const text = commentText.trim();
    if (!text) return;

    setBusy(true);
    try {
      const { comment } = await api<{ comment: WorkbenchCommentDTO }>(
        `/api/workbench/tasks/${task.id}/comments`,
        { method: "POST", body: JSON.stringify({ body: text }) }
      );
      setComments((prev) => [...prev, comment]);
      setCommentText("");
    } finally {
      setBusy(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    setBusy(true);
    try {
      await api(`/api/workbench/comments/${commentId}`, { method: "DELETE" });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } finally {
      setBusy(false);
    }
  };

  if (!task) return <div className="p-4 text-sm text-white/70">Select a task to view details.</div>;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-white">{task.title}</div>
          <div className="text-xs text-white/50">
            {task.client} • Due {task.dueDate ?? "—"} • {task.status}
          </div>
        </div>

        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
      </div>

      <div className="grid gap-3 p-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs font-semibold text-white/70">Conversation (Comments)</div>

          <div className="mt-2 space-y-2 text-sm text-white/75">
            {comments.length === 0 && <div className="text-sm text-white/50">No comments yet.</div>}

            {comments.map((c) => (
              <div
                key={c.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-2"
              >
                <div>
                  <div className="text-xs text-white/50">{new Date(c.createdAt).toLocaleString()}</div>
                  <div>{c.body}</div>
                </div>

                <button
                  disabled={busy}
                  onClick={() => deleteComment(c.id)}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 disabled:opacity-50"
                  title="Delete comment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-white/20"
            />
            <button
              disabled={busy}
              onClick={addComment}
              className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50"
            >
              Comment
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs font-semibold text-white/70">Files</div>
          <div className="mt-2 text-sm text-white/70">
            MVP note: file uploads come next (S3/R2 + signed URLs).
          </div>
        </div>
      </div>
    </div>
  );
}