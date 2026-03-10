"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutGrid,
  Network,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { TaskTable } from "./TaskTable";
import { TaskDetail } from "./TaskDetail";
import { RelationshipMap } from "./RelationshipMap";
import { InspectorPanel } from "./InspectorPanel";
import { TaskEditorModal } from "./TaskEditorModal";
import type { WorkbenchTaskDTO, WorkbenchTaskLinkDTO } from "./types";

type WorkbenchTaskUpsert = Omit<WorkbenchTaskDTO, "id" | "mapX" | "mapY">;

type TasksResponse = {
  tasks: any[];
  links: any[];
};

const STATUS_FILTERS = [
  "All",
  "Open",
  "InProgress",
  "Review",
  "Completed",
  "Overdue",
] as const;

type ShellTabId =
  | "Workbench"
  | "Weekly"
  | "Timeline"
  | "Milestones"
  | "Notes";

const DEFAULT_SHELL_TABS: ShellTabId[] = [
  "Workbench",
  "Weekly",
  "Timeline",
  "Milestones",
  "Notes",
];

const SHELL_TAB_ORDER_STORAGE_KEY = "workbench:shell-tab-order:v1";
const SHELL_ACTIVE_TAB_STORAGE_KEY = "workbench:shell-active-tab:v1";

const DAY_MS = 24 * 60 * 60 * 1000;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? `Request failed: ${res.status}`
    );
  }

  return data as T;
}

function mapTask(task: any): WorkbenchTaskDTO {
  return {
    id: task.id,
    title: task.title,
    client: task.client,
    dueDate: task.dueDate
      ? new Date(task.dueDate).toISOString().slice(0, 10)
      : null,
    assignee: task.assignee,
    status: task.status,
    priority: task.priority,
    mapX: typeof task.mapX === "number" ? task.mapX : 40,
    mapY: typeof task.mapY === "number" ? task.mapY : 40,
  };
}

function mapLink(link: any): WorkbenchTaskLinkDTO {
  return {
    id: link.id,
    sourceTaskId: link.sourceTaskId,
    targetTaskId: link.targetTaskId,
  };
}

function isShellTabId(value: unknown): value is ShellTabId {
  return (
    value === "Workbench" ||
    value === "Weekly" ||
    value === "Timeline" ||
    value === "Milestones" ||
    value === "Notes"
  );
}

function isValidShellTabOrder(value: unknown): value is ShellTabId[] {
  if (!Array.isArray(value)) return false;
  if (value.length !== DEFAULT_SHELL_TABS.length) return false;

  const set = new Set(value);
  if (set.size !== DEFAULT_SHELL_TABS.length) return false;

  return DEFAULT_SHELL_TABS.every((tab) => set.has(tab));
}

function parseDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function diffInDays(start: Date, end: Date) {
  return Math.round(
    (startOfDay(end).getTime() - startOfDay(start).getTime()) / DAY_MS
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatShortDueDate(dateString: string | null) {
  if (!dateString) return "Unscheduled";

  return parseDate(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function toneForStatus(status: WorkbenchTaskDTO["status"]) {
  switch (status) {
    case "Completed":
      return {
        pill: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
        dot: "bg-emerald-300 shadow-[0_0_0_4px_rgba(16,185,129,0.16)]",
      };
    case "InProgress":
      return {
        pill: "border-sky-500/30 bg-sky-500/10 text-sky-200",
        dot: "bg-sky-300 shadow-[0_0_0_4px_rgba(56,189,248,0.16)]",
      };
    case "Review":
      return {
        pill: "border-amber-500/30 bg-amber-500/10 text-amber-200",
        dot: "bg-amber-300 shadow-[0_0_0_4px_rgba(245,158,11,0.16)]",
      };
    case "Overdue":
      return {
        pill: "border-rose-500/30 bg-rose-500/10 text-rose-200",
        dot: "bg-rose-300 shadow-[0_0_0_4px_rgba(244,63,94,0.18)]",
      };
    default:
      return {
        pill: "border-white/10 bg-white/5 text-white/75",
        dot: "bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.08)]",
      };
  }
}

function moveTab(order: ShellTabId[], fromId: ShellTabId, toId: ShellTabId) {
  const next = [...order];
  const fromIndex = next.indexOf(fromId);
  const toIndex = next.indexOf(toId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return order;
  }

  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function ShellTabs({
  value,
  order,
  onChange,
  onReorder,
}: {
  value: ShellTabId;
  order: ShellTabId[];
  onChange: (tab: ShellTabId) => void;
  onReorder: (next: ShellTabId[]) => void;
}) {
  const [draggingId, setDraggingId] = useState<ShellTabId | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {order.map((tab) => {
        const active = value === tab;

        return (
          <button
            key={tab}
            type="button"
            draggable
            onClick={() => onChange(tab)}
            onDragStart={() => setDraggingId(tab)}
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(event) => {
              if (!draggingId || draggingId === tab) return;
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (!draggingId || draggingId === tab) return;
              onReorder(moveTab(order, draggingId, tab));
              setDraggingId(null);
            }}
            title="Drag to reorder"
            className={[
              "rounded-xl border px-3 py-2 text-xs font-semibold transition",
              active
                ? "border-white/15 bg-white/10 text-white"
                : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/5 hover:text-white/85",
              draggingId === tab ? "opacity-70" : "",
            ].join(" ")}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

function PlaceholderPanel({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#070A10] p-5">
      <div className="max-w-xl">
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
          Reserved
        </div>
        <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/55">{body}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-white/40">
        This tab is intentionally empty for now.
      </div>
    </section>
  );
}

function WeeklyView({
  tasks,
  selectedTaskId,
  onSelectTask,
}: {
  tasks: WorkbenchTaskDTO[];
  selectedTaskId?: string;
  onSelectTask?: (taskId: string) => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const weekEnd = useMemo(() => addDays(today, 7), [today]);

  const buckets = useMemo(() => {
    const overdue: WorkbenchTaskDTO[] = [];
    const next7: WorkbenchTaskDTO[] = [];
    const later: WorkbenchTaskDTO[] = [];
    const unscheduled: WorkbenchTaskDTO[] = [];

    for (const task of tasks) {
      if (!task.dueDate) {
        unscheduled.push(task);
        continue;
      }

      const due = startOfDay(parseDate(task.dueDate));

      if (due < today && task.status !== "Completed") {
        overdue.push(task);
        continue;
      }

      if (due <= weekEnd) {
        next7.push(task);
        continue;
      }

      later.push(task);
    }

    const byDueDate = (a: WorkbenchTaskDTO, b: WorkbenchTaskDTO) => {
      if (!a.dueDate && !b.dueDate) return a.title.localeCompare(b.title);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime();
    };

    overdue.sort(byDueDate);
    next7.sort(byDueDate);
    later.sort(byDueDate);
    unscheduled.sort((a, b) => a.title.localeCompare(b.title));

    return [
      {
        title: "Overdue",
        subtitle: "Past due and still open",
        tasks: overdue,
      },
      {
        title: "Next 7 days",
        subtitle: "The immediate execution horizon",
        tasks: next7,
      },
      {
        title: "Beyond this week",
        subtitle: "Scheduled, but not urgent yet",
        tasks: later,
      },
      {
        title: "Unscheduled",
        subtitle: "Needs a due date before planning is trustworthy",
        tasks: unscheduled,
      },
    ];
  }, [tasks, today, weekEnd]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
            Horizon
          </div>
          <div className="mt-2 text-lg font-semibold text-white">Weekly</div>
          <div className="mt-1 text-sm text-white/55">
            A focused view of what is late, what is imminent, and what still
            needs commitment.
          </div>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-rose-200/70">
            Critical
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {buckets[0]?.tasks.length ?? 0}
          </div>
          <div className="mt-1 text-sm text-white/55">Overdue tasks</div>
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-sky-200/70">
            Immediate
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {buckets[1]?.tasks.length ?? 0}
          </div>
          <div className="mt-1 text-sm text-white/55">Due within 7 days</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {buckets.map((bucket) => (
          <section
            key={bucket.title}
            className="rounded-3xl border border-white/10 bg-[#070A10] p-4"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {bucket.title}
                </h3>
                <p className="mt-1 text-xs text-white/45">{bucket.subtitle}</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
                {bucket.tasks.length}
              </div>
            </div>

            {bucket.tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
                No tasks in this bucket.
              </div>
            ) : (
              <div className="space-y-2">
                {bucket.tasks.map((task) => {
                  const active = selectedTaskId === task.id;
                  const tone = toneForStatus(task.status);

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onSelectTask?.(task.id)}
                      className={[
                        "w-full rounded-2xl border p-3 text-left transition",
                        active
                          ? "border-sky-300/45 bg-sky-300/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">
                            {task.title}
                          </div>
                          <div className="mt-1 text-xs text-white/50">
                            {task.client} • {task.assignee}
                          </div>
                        </div>

                        <div
                          className={[
                            "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                            tone.pill,
                          ].join(" ")}
                        >
                          {task.status}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-white/55">
                        <span>Due {formatShortDueDate(task.dueDate)}</span>
                        <span>Priority {task.priority}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function LinearTimelineView({
  tasks,
  selectedTaskId,
  onSelectTask,
}: {
  tasks: WorkbenchTaskDTO[];
  selectedTaskId?: string;
  onSelectTask?: (taskId: string) => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);

  const scheduled = useMemo(() => {
    return tasks
      .filter((task) => Boolean(task.dueDate))
      .map((task) => ({
        task,
        due: parseDate(task.dueDate as string),
      }))
      .sort((a, b) => a.due.getTime() - b.due.getTime());
  }, [tasks]);

  const unscheduled = useMemo(
    () => tasks.filter((task) => !task.dueDate),
    [tasks]
  );

  const windowStart = useMemo(() => {
    if (!scheduled.length) return addDays(today, -7);
    const earliest = scheduled[0].due;
    const paddedEarliest = addDays(earliest, -5);
    return paddedEarliest < addDays(today, -7)
      ? paddedEarliest
      : addDays(today, -7);
  }, [scheduled, today]);

  const windowEnd = useMemo(() => {
    if (!scheduled.length) return addDays(today, 21);
    const latest = scheduled[scheduled.length - 1].due;
    const paddedLatest = addDays(latest, 10);
    return paddedLatest > addDays(today, 21)
      ? paddedLatest
      : addDays(today, 21);
  }, [scheduled, today]);

  const totalDays = useMemo(
    () => Math.max(1, diffInDays(windowStart, windowEnd)),
    [windowStart, windowEnd]
  );

  const todayPercent = useMemo(() => {
    const days = diffInDays(windowStart, today);
    return Math.min(100, Math.max(0, (days / totalDays) * 100));
  }, [windowStart, today, totalDays]);

  const ticks = useMemo(() => {
    const values: Date[] = [];
    for (let offset = 0; offset <= totalDays; offset += 7) {
      values.push(addDays(windowStart, offset));
    }

    const lastTick = values[values.length - 1];
    if (!lastTick || diffInDays(lastTick, windowEnd) > 0) {
      values.push(windowEnd);
    }

    return values;
  }, [windowStart, windowEnd, totalDays]);

  const dueThisWeek = useMemo(() => {
    const sevenDaysOut = addDays(today, 7);
    return scheduled.filter(
      ({ due, task }) =>
        due >= today && due <= sevenDaysOut && task.status !== "Completed"
    ).length;
  }, [scheduled, today]);

  const overdueCount = useMemo(() => {
    return scheduled.filter(
      ({ due, task }) => due < today && task.status !== "Completed"
    ).length;
  }, [scheduled, today]);

  const positionForDate = (date: Date) => {
    const days = diffInDays(windowStart, date);
    return Math.min(100, Math.max(0, (days / totalDays) * 100));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
            View
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            Linear timeline
          </div>
          <div className="mt-1 text-sm text-white/55">
            Due-date driven, no schema migration required.
          </div>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-rose-200/70">
            Risk
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {overdueCount}
          </div>
          <div className="mt-1 text-sm text-white/55">Overdue tasks</div>
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-sky-200/70">
            Near-term
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {dueThisWeek}
          </div>
          <div className="mt-1 text-sm text-white/55">Due within 7 days</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
            Unscheduled
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {unscheduled.length}
          </div>
          <div className="mt-1 text-sm text-white/55">Needs commitment</div>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_1fr_110px] md:items-end">
          <div>
            <h3 className="text-sm font-semibold text-white">Scheduled tasks</h3>
            <p className="mt-1 text-xs text-white/45">
              Click any row to sync task selection.
            </p>
          </div>

          <div className="relative h-8">
            {ticks.map((tick) => {
              const left = positionForDate(tick);
              return (
                <div
                  key={tick.toISOString()}
                  className="absolute bottom-0 top-0"
                  style={{ left: `${left}%` }}
                >
                  <div className="h-full w-px bg-white/10" />
                  <div className="mt-1 -translate-x-1/2 text-[10px] uppercase tracking-[0.14em] text-white/35">
                    {formatDate(tick)}
                  </div>
                </div>
              );
            })}

            <div
              className="absolute bottom-0 top-0"
              style={{ left: `${todayPercent}%` }}
            >
              <div className="h-full w-px bg-sky-300/60" />
              <div className="mt-1 -translate-x-1/2 rounded-full border border-sky-300/20 bg-sky-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100">
                Today
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] uppercase tracking-[0.18em] text-white/40">
            Due date
          </div>
        </div>

        {!scheduled.length ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-white/45">
            No scheduled tasks yet. Add due dates and the timeline becomes useful.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {scheduled.map(({ task, due }) => {
              const left = positionForDate(due);
              const active = selectedTaskId === task.id;
              const tone = toneForStatus(task.status);

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onSelectTask?.(task.id)}
                  className={[
                    "grid w-full gap-3 rounded-2xl border p-3 text-left transition md:grid-cols-[minmax(0,220px)_1fr_110px] md:items-center",
                    active
                      ? "border-sky-300/45 bg-sky-300/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">
                      {task.title}
                    </div>
                    <div className="mt-1 text-xs text-white/50">
                      {task.client} • {task.assignee}
                    </div>
                    <div
                      className={[
                        "mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        tone.pill,
                      ].join(" ")}
                    >
                      {task.status}
                    </div>
                  </div>

                  <div className="relative h-10">
                    <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />

                    {ticks.map((tick) => (
                      <div
                        key={`${task.id}-${tick.toISOString()}`}
                        className="absolute bottom-0 top-0 w-px bg-white/5"
                        style={{ left: `${positionForDate(tick)}%` }}
                      />
                    ))}

                    <div
                      className="absolute bottom-0 top-0 w-px bg-sky-300/25"
                      style={{ left: `${todayPercent}%` }}
                    />

                    <div
                      className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-white/8"
                      style={{ width: `${left}%` }}
                    />

                    <div
                      className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/30"
                      style={{ left: `${left}%` }}
                    >
                      <div
                        className={["h-full w-full rounded-full", tone.dot].join(
                          " "
                        )}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {formatDate(due)}
                    </div>
                    <div className="mt-1 text-xs text-white/45">
                      Priority {task.priority}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Unscheduled</h3>
            <p className="mt-1 text-xs text-white/45">
              These tasks exist, but they are not committed to linear time yet.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
            {unscheduled.length}
          </div>
        </div>

        {unscheduled.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
            Everything in the current result set has a due date.
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {unscheduled.map((task) => {
              const active = selectedTaskId === task.id;
              const tone = toneForStatus(task.status);

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onSelectTask?.(task.id)}
                  className={[
                    "rounded-2xl border p-3 text-left transition",
                    active
                      ? "border-sky-300/45 bg-sky-300/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                  ].join(" ")}
                >
                  <div className="text-sm font-semibold text-white">{task.title}</div>
                  <div className="mt-1 text-xs text-white/50">
                    {task.client} • {task.assignee}
                  </div>
                  <div
                    className={[
                      "mt-3 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                      tone.pill,
                    ].join(" ")}
                  >
                    {task.status}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function WorkbenchView() {
  const [loading, setLoading] = useState(true);
  const [tasksRaw, setTasksRaw] = useState<WorkbenchTaskDTO[]>([]);
  const [linksRaw, setLinksRaw] = useState<WorkbenchTaskLinkDTO[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("All");
  const [selectedId, setSelectedId] = useState("");
  const [shellTab, setShellTab] = useState<ShellTabId>("Workbench");
  const [shellTabOrder, setShellTabOrder] =
    useState<ShellTabId[]>(DEFAULT_SHELL_TABS);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");

  const loadWorkbench = useCallback(async () => {
    const { tasks, links } = await api<TasksResponse>("/api/workbench/tasks");
    const mappedTasks = tasks.map(mapTask);
    const mappedLinks = links.map(mapLink);

    setTasksRaw(mappedTasks);
    setLinksRaw(mappedLinks);
    setSelectedId((prev) => prev || mappedTasks[0]?.id || "");
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const { tasks, links } = await api<TasksResponse>("/api/workbench/tasks");

        if (!mounted) return;

        const mappedTasks = tasks.map(mapTask);
        const mappedLinks = links.map(mapLink);

        setTasksRaw(mappedTasks);
        setLinksRaw(mappedLinks);
        setSelectedId((prev) => prev || mappedTasks[0]?.id || "");
      } catch (error) {
        console.error("Failed to load workbench", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawOrder = window.localStorage.getItem(SHELL_TAB_ORDER_STORAGE_KEY);
      const rawActive = window.localStorage.getItem(SHELL_ACTIVE_TAB_STORAGE_KEY);

      if (rawOrder) {
        const parsed = JSON.parse(rawOrder) as unknown;
        if (isValidShellTabOrder(parsed)) {
          setShellTabOrder(parsed);
        }
      }

      if (rawActive && isShellTabId(rawActive)) {
        setShellTab(rawActive);
      }
    } catch (error) {
      console.error("Failed to restore workbench shell tabs", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      SHELL_TAB_ORDER_STORAGE_KEY,
      JSON.stringify(shellTabOrder)
    );
  }, [shellTabOrder]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SHELL_ACTIVE_TAB_STORAGE_KEY, shellTab);
  }, [shellTab]);

  const selected = useMemo(
    () => tasksRaw.find((task) => task.id === selectedId) ?? tasksRaw[0],
    [tasksRaw, selectedId]
  );

  const tasks = useMemo(() => {
    return tasksRaw
      .filter((task) =>
        statusFilter === "All" ? true : task.status === statusFilter
      )
      .filter((task) => {
        if (!query.trim()) return true;

        const q = query.toLowerCase();
        return (
          task.title.toLowerCase().includes(q) ||
          task.client.toLowerCase().includes(q) ||
          task.assignee.toLowerCase().includes(q)
        );
      });
  }, [tasksRaw, query, statusFilter]);

  const visibleTaskIds = useMemo(
    () => new Set(tasks.map((task) => task.id)),
    [tasks]
  );

  const visibleLinks = useMemo(() => {
    return linksRaw.filter(
      (link) =>
        visibleTaskIds.has(link.sourceTaskId) &&
        visibleTaskIds.has(link.targetTaskId)
    );
  }, [linksRaw, visibleTaskIds]);

  const openCreate = () => {
    setEditorMode("create");
    setEditorOpen(true);
  };

  const openEdit = (taskId: string) => {
    setSelectedId(taskId);
    setEditorMode("edit");
    setEditorOpen(true);
  };

  const createTask = async (payload: WorkbenchTaskUpsert) => {
    const { task } = await api<{ task: any }>("/api/workbench/tasks", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        dueDate: payload.dueDate ? payload.dueDate : null,
      }),
    });

    const mapped = mapTask(task);
    setTasksRaw((prev) => [mapped, ...prev]);
    setSelectedId(mapped.id);
  };

  const updateTask = async (
    taskId: string,
    patch: Partial<WorkbenchTaskUpsert>
  ) => {
    const { task } = await api<{ task: any }>(`/api/workbench/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...patch,
        dueDate:
          patch.dueDate !== undefined
            ? patch.dueDate
              ? patch.dueDate
              : null
            : undefined,
      }),
    });

    const mapped = mapTask(task);
    setTasksRaw((prev) =>
      prev.map((existing) => (existing.id === taskId ? mapped : existing))
    );
  };

  const updateTaskPosition = async (
    taskId: string,
    mapX: number,
    mapY: number
  ) => {
    setTasksRaw((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, mapX, mapY } : task
      )
    );

    try {
      await api<{ task: any }>(`/api/workbench/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ mapX, mapY }),
      });
    } catch (error) {
      console.error("Failed to persist task position", error);
      await loadWorkbench();
    }
  };

  const createLink = async (sourceTaskId: string, targetTaskId: string) => {
    const { link } = await api<{ link: any }>("/api/workbench/task-links", {
      method: "POST",
      body: JSON.stringify({ sourceTaskId, targetTaskId }),
    });

    const mapped = mapLink(link);

    setLinksRaw((prev) => {
      const exists = prev.some(
        (existing) =>
          existing.id === mapped.id ||
          (existing.sourceTaskId === mapped.sourceTaskId &&
            existing.targetTaskId === mapped.targetTaskId)
      );

      return exists ? prev : [...prev, mapped];
    });
  };

  const deleteLink = async (linkId: string) => {
    const previous = linksRaw;
    setLinksRaw((prev) => prev.filter((link) => link.id !== linkId));

    try {
      await api(`/api/workbench/task-links/${linkId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete link", error);
      setLinksRaw(previous);
    }
  };

  const deleteTask = async (taskId: string) => {
    await api(`/api/workbench/tasks/${taskId}`, {
      method: "DELETE",
    });

    setTasksRaw((prev) => prev.filter((task) => task.id !== taskId));
    setLinksRaw((prev) =>
      prev.filter(
        (link) =>
          link.sourceTaskId !== taskId && link.targetTaskId !== taskId
      )
    );
    setSelectedId((prev) => (prev === taskId ? "" : prev));
  };

  const renderWorkbenchPane = () => {
    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
        <div className="grid gap-4">
          <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                  Tasks
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  Workbench Tasks
                </div>
              </div>

              <div className="text-xs text-white/50">
                {loading ? "Loading..." : `${tasks.length} shown`}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/10">
              <TaskTable
                tasks={tasks}
                selectedId={selected?.id ?? ""}
                onSelect={setSelectedId}
                onEdit={openEdit}
                onDelete={deleteTask}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
            <TaskDetail
              task={selected}
              onEdit={selected ? () => openEdit(selected.id) : undefined}
            />
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
            <InspectorPanel task={selected} />
          </section>
        </div>

        <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                Map
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                Relationship Map
              </div>
            </div>

            <div className="text-xs text-white/45">
              Drag nodes to organize work visually
            </div>
          </div>

          <div className="h-[760px] min-w-0">
            <RelationshipMap
              tasks={tasks}
              links={visibleLinks}
              selectedTaskId={selected?.id ?? ""}
              onSelectTask={setSelectedId}
              onMoveTask={updateTaskPosition}
              onCreateLink={createLink}
              onDeleteLink={deleteLink}
            />
          </div>
        </section>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (shellTab) {
      case "Workbench":
        return renderWorkbenchPane();

      case "Weekly":
        return (
          <WeeklyView
            tasks={tasks}
            selectedTaskId={selected?.id}
            onSelectTask={setSelectedId}
          />
        );

      case "Timeline":
        return (
          <LinearTimelineView
            tasks={tasks}
            selectedTaskId={selected?.id}
            onSelectTask={setSelectedId}
          />
        );

      case "Milestones":
        return (
          <PlaceholderPanel
            title="Milestones"
            body="This should become the executive checkpoint layer: launches, approvals, deliverables, and major gates."
          />
        );

      case "Notes":
        return (
          <PlaceholderPanel
            title="Notes"
            body="This should become the strategic scratchpad: roadmap notes, planning reminders, and decision logs tied to the workbench."
          />
        );

      default:
        return renderWorkbenchPane();
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <ShellTabs
            value={shellTab}
            order={shellTabOrder}
            onChange={setShellTab}
            onReorder={setShellTabOrder}
          />

          <div className="text-[11px] text-white/35">
            Drag tabs to reorder. This first pass persists in this browser.
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tasks, clients, assignees..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-9 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
            />
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => {
              const active = statusFilter === status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={[
                    "rounded-full border px-3 py-1 text-xs transition",
                    active
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-white/10 bg-transparent text-white/60 hover:bg-white/5",
                  ].join(" ")}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/45">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
            <LayoutGrid className="h-3.5 w-3.5" />
            Table workflow
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
            <Network className="h-3.5 w-3.5" />
            Full map canvas
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
            {loading ? "Loading..." : `${tasks.length} visible`}
          </span>
        </div>
      </section>

      {renderActiveTab()}

      <TaskEditorModal
        open={editorOpen}
        mode={editorMode}
        task={selected}
        onClose={() => setEditorOpen(false)}
        onCreate={createTask}
        onUpdate={updateTask}
      />
    </div>
  );
}