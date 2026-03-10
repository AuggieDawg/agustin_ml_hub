"use client";

import { useMemo } from "react";
import type { WorkbenchTaskDTO } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

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

function statusTone(status: WorkbenchTaskDTO["status"]) {
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

export function LinearTimelineView({
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
              const tone = statusTone(task.status);

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
                      <div className={["h-full w-full rounded-full", tone.dot].join(" ")} />
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
              const tone = statusTone(task.status);

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