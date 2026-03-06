"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type ApiErrorShape = { error?: string; details?: unknown };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await res.json().catch(() => ({}))) as ApiErrorShape & T;
  if (!res.ok) throw new Error(data?.error ?? `Request failed: ${res.status}`);
  return data as T;
}

export function TaskDetail({ task, onEdit }: { task?: WorkbenchTaskDTO; onEdit?: () => void }) {
  const taskId = task?.id ?? null;

  const [comments, setComments] = useState<WorkbenchCommentDTO[]>([]);
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Abort in-flight fetch when task changes quickly (prevents race updates)
  const abortRef = useRef<AbortController | null>(null);

  const headerLine = useMemo(() => {
    if (!task) return "";
    return `${task.client} • Due ${task.dueDate ?? "—"} • ${task.status}`;
  }, [task]);

  const loadComments = useCallback(async (id: string) => {
    setError(null);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const { comments } = await api<{ comments: WorkbenchCommentDTO[] }>(
      `/api/workbench/tasks/${id}/comments`,
      { signal: ac.signal }
    );

    setComments(comments);
  }, []);

  useEffect(() => {
    setComments([]);
    setCommentText("");
    setError(null);

    if (!taskId) return;

    loadComments(taskId).catch((e) => {
      if (String(e?.name) === "AbortError") return;
      setError(e?.message ?? "Failed to load comments");
    });

    return () => {
      abortRef.current?.abort();
    };
  }, [taskId, loadComments]);

  const addComment = useCallback(async () => {
    if (!taskId) return;

    const text = commentText.trim();
    if (!text) return;

    setBusy(true);
    setError(null);

    try {
      const { comment } = await api<{ comment: WorkbenchCommentDTO }>(
        `/api/workbench/tasks/${taskId}/comments`,
        { method: "POST", body: JSON.stringify({ body: text }) }
      );

      setComments((prev) => [...prev, comment]);
      setCommentText("");
    } catch (e: any) {
      setError(e?.message ?? "Failed to add comment");
    } finally {
      setBusy(false);
    }
  }, [taskId, commentText]);

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!taskId) return;

      setBusy(true);
      setError(null);

      try {
        // ✅ IMPORTANT: matches your real route:
        // /api/workbench/tasks/[taskId]/comments/[commentId]
        await api(`/api/workbench/tasks/${taskId}/comments/${commentId}`, { method: "DELETE" });

        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (e: any) {
        setError(e?.message ?? "Failed to delete comment");
      } finally {
        setBusy(false);
      }
    },
    [taskId]
  );

  if (!task) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
        Select a task to view details.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{task.title}</div>
          <div className="mt-1 text-sm text-white/60">{headerLine}</div>
        </div>

        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          type="button"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-5">
        <div className="text-sm font-semibold text-white/80">Conversation (Comments)</div>

        <div className="mt-3 space-y-2">
          {comments.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
              No comments yet.
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="min-w-0">
                  <div className="text-xs text-white/40">
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-1 text-sm text-white/80">{c.body}</div>
                </div>

                <button
                  onClick={() => deleteComment(c.id)}
                  disabled={busy}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 disabled:opacity-50"
                  title="Delete comment"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
          />
          <button
            onClick={addComment}
            disabled={busy || commentText.trim().length === 0}
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50"
            type="button"
          >
            Comment
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold text-white/80">Files</div>
        <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
          MVP note: file uploads come next (S3/R2 + signed URLs).
        </div>
      </div>
    </div>
  );
}