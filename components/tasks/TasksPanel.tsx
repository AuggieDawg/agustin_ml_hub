"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type TaskScope = "client" | "owner";

type ApiTask = {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
};

type Props = {
  scope?: TaskScope;
  label?: string;
};

function normalizeTask(task: ApiTask): Task {
  return {
    id: task.id,
    title: task.title,
    completed: Boolean(task.completed),
    createdAt: task.createdAt,
  };
}

function formatDateTime(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function TasksPanel({
  scope = "client",
  label,
}: Props) {
  const apiBase = useMemo(() => {
    return scope === "owner" ? "/api/owner-tasks" : "/api/tasks";
  }, [scope]);

  const panelLabel = label ?? (scope === "owner" ? "Owner Tasks" : "Client Tasks");

  const [items, setItems] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiBase, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error ?? `Request failed: ${res.status}`);
      }

      const tasks = Array.isArray(data?.tasks) ? data.tasks : [];
      setItems(tasks.map(normalizeTask));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load tasks";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleaned = title.trim();
    if (!cleaned) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cleaned }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error ?? `Create failed: ${res.status}`);
      }

      setTitle("");
      await load();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create task";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleCompleted(task: Task) {
    setBusyId(task.id);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error ?? `Update failed: ${res.status}`);
      }

      await load();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update task";
      setError(message);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteTask(task: Task) {
    setBusyId(task.id);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/${task.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error ?? `Delete failed: ${res.status}`);
      }

      await load();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete task";
      setError(message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 20,
      }}
    >
      <div
        style={{
          padding: 20,
          borderRadius: 20,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: "white",
            marginBottom: 8,
          }}
        >
          {panelLabel}
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.72)",
            marginBottom: 18,
          }}
        >
          Create, complete, and remove tasks from one stable API contract.
        </div>

        <form
          onSubmit={createTask}
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task..."
            style={{
              flex: "1 1 320px",
              minWidth: 240,
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.28)",
              color: "white",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(90,120,255,0.35)",
              color: "white",
              fontWeight: 800,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Adding..." : "Add Task"}
          </button>
        </form>

        {error ? (
          <div
            style={{
              marginTop: 14,
              color: "#ff8d8d",
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        ) : null}
      </div>

      <div
        style={{
          padding: 20,
          borderRadius: 20,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.78)" }}>Loading tasks...</div>
        ) : items.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.68)" }}>No tasks yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: 16,
                  borderRadius: 16,
                  background: "rgba(0,0,0,0.28)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      color: "white",
                      fontWeight: 800,
                      textDecoration: task.completed ? "line-through" : "none",
                      opacity: task.completed ? 0.7 : 1,
                    }}
                  >
                    {task.title}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      color: "rgba(255,255,255,0.60)",
                      fontSize: 13,
                    }}
                  >
                    {task.createdAt
                      ? `Created: ${formatDateTime(task.createdAt)}`
                      : ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => toggleCompleted(task)}
                    disabled={busyId === task.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                      fontWeight: 800,
                      cursor: busyId === task.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {task.completed ? "Completed ✅" : "Open ⏳"}
                  </button>

                  <button
                    onClick={() => deleteTask(task)}
                    disabled={busyId === task.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,0,0,0.12)",
                      color: "white",
                      fontWeight: 800,
                      cursor: busyId === task.id ? "not-allowed" : "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}