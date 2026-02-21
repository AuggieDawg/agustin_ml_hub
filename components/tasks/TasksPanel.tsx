"use client";

/**
 * components/tasks/TasksPanel.tsx
 *
 * Reusable task UI for BOTH:
 * - Portal user tasks:   /api/tasks
 * - Owner private tasks: /api/owner-tasks
 *
 * Why this exists:
 * - Keeps the UI identical while changing the backend scope cleanly.
 * - Eliminates duplication and prevents endpoint drift.
 *
 * IMPORTANT BUG FIX:
 * - If the API base URL becomes undefined, fetch() hits "/undefined".
 * - This file hard-guards against that and deterministically maps scope -> endpoint.
 */

import { useEffect, useMemo, useState } from "react";

type TaskScope = "user" | "owner";

type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt?: string; // ISO string from API
};

type Props = {
  /**
   * "user"  -> /api/tasks
   * "owner" -> /api/owner-tasks
   */
  scope?: TaskScope;

  /**
   * Optional label override.
   */
  label?: string;
};

function formatDateTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export function TasksPanel({ scope = "user", label }: Props) {
  // Deterministic API base; never allow undefined.
  const apiBase = useMemo(() => {
    return scope === "owner" ? "/api/owner-tasks" : "/api/tasks";
  }, [scope]);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiBase, { method: "GET" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to load tasks (${res.status}): ${txt}`.trim());
      }
      const json = await res.json();
      // Expecting { tasks: Task[] } OR Task[] depending on how your route is written.
      const tasks: Task[] = Array.isArray(json) ? json : json.tasks ?? [];
      setItems(tasks);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  async function createTask() {
    const clean = title.trim();
    if (!clean) return;

    setError(null);
    setBusyId("CREATE");

    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: clean }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Create failed (${res.status}): ${txt}`.trim());
      }

      setTitle("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleDone(t: Task) {
    setError(null);
    setBusyId(t.id);

    try {
      const res = await fetch(`${apiBase}/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !t.done }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Update failed (${res.status}): ${txt}`.trim());
      }

      await load();
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteOne(t: Task) {
    setError(null);
    setBusyId(t.id);

    try {
      // IMPORTANT: delete a single task by id route.
      const res = await fetch(`${apiBase}/${t.id}`, { method: "DELETE" });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Delete failed (${res.status}): ${txt}`.trim());
      }

      await load();
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setBusyId(null);
    }
  }

  const panelLabel =
    label ?? (scope === "owner" ? "Owner Tasks" : "Your Tasks");

  // Minimal “bubble” styling (you can refine later).
  // Owner: red glossy bubble.
  // User: darker glossy bubble with black-ish text option later.
  const bubbleStyle = (scopeLocal: TaskScope) => {
    if (scopeLocal === "owner") {
      return {
        border: "1px solid rgba(255,255,255,0.10)",
        background:
          "linear-gradient(135deg, rgba(255,0,80,0.30), rgba(255,255,255,0.04))",
        boxShadow: "inset 0 0 18px rgba(255,0,80,0.18)",
      } as const;
    }
    return {
      border: "1px solid rgba(255,255,255,0.10)",
      background:
        "linear-gradient(135deg, rgba(0,180,255,0.18), rgba(255,255,255,0.03))",
      boxShadow: "inset 0 0 18px rgba(0,180,255,0.10)",
    } as const;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 900 }}>{panelLabel}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.60)" }}>
          API: {apiBase}
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title…"
          style={{
            flex: "1 1 260px",
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.35)",
            color: "rgba(255,255,255,0.90)",
          }}
        />
        <button
          onClick={createTask}
          disabled={!title.trim() || busyId === "CREATE"}
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.92)",
            cursor: !title.trim() || busyId === "CREATE" ? "not-allowed" : "pointer",
            fontWeight: 800,
          }}
        >
          {busyId === "CREATE" ? "Adding…" : "Add Task"}
        </button>

        <button
          onClick={load}
          disabled={loading}
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.92)",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 750,
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 14,
            border: "1px solid rgba(255,130,130,0.35)",
            background: "rgba(255,0,0,0.08)",
            color: "rgba(255,190,190,0.95)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.70)" }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.70)" }}>No tasks yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((t) => (
              <div
                key={t.id}
                style={{
                  ...bubbleStyle(scope),
                  borderRadius: 18,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, color: "rgba(255,255,255,0.92)" }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
                    {t.createdAt ? `Created: ${formatDateTime(t.createdAt)}` : ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => toggleDone(t)}
                    disabled={busyId === t.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(0,0,0,0.25)",
                      color: "rgba(255,255,255,0.90)",
                      cursor: busyId === t.id ? "not-allowed" : "pointer",
                      fontWeight: 800,
                    }}
                    title="Toggle done"
                  >
                    {t.done ? "Done ✅" : "Open ⏳"}
                  </button>

                  <button
                    onClick={() => deleteOne(t)}
                    disabled={busyId === t.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,0,0,0.10)",
                      color: "rgba(255,255,255,0.92)",
                      cursor: busyId === t.id ? "not-allowed" : "pointer",
                      fontWeight: 850,
                    }}
                    title="Delete task"
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

export default TasksPanel;
