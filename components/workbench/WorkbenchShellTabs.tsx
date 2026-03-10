"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_WORKBENCH_SHELL_TABS,
  type WorkbenchShellTabId,
} from "./types";

const TAB_LABELS: Record<WorkbenchShellTabId, string> = {
  Workbench: "Workbench",
  Weekly: "Weekly",
  Timeline: "Timeline",
  Milestones: "Milestones",
  Notes: "Notes",
};

function moveTab(
  order: WorkbenchShellTabId[],
  fromId: WorkbenchShellTabId,
  toId: WorkbenchShellTabId
) {
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

export function WorkbenchShellTabs({
  value,
  onChange,
  order = DEFAULT_WORKBENCH_SHELL_TABS,
  onReorder,
}: {
  value: WorkbenchShellTabId;
  onChange: (tab: WorkbenchShellTabId) => void;
  order?: WorkbenchShellTabId[];
  onReorder?: (next: WorkbenchShellTabId[]) => void;
}) {
  const [draggingId, setDraggingId] = useState<WorkbenchShellTabId | null>(null);

  const tabs = useMemo(
    () => (order.length ? order : DEFAULT_WORKBENCH_SHELL_TABS),
    [order]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
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
              onReorder?.(moveTab(tabs, draggingId, tab));
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
            {TAB_LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
}