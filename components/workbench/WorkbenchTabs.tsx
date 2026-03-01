"use client";

export function WorkbenchTabs({
  value,
  onChange,
}: {
  value: "Map" | "Timeline" | "Quick";
  onChange: (v: "Map" | "Timeline" | "Quick") => void;
}) {
  const tabs = ["Map", "Timeline", "Quick"] as const;

  return (
    <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
      <div className="flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
        {tabs.map((t) => {
          const active = value === t;
          return (
            <button
              key={t}
              onClick={() => onChange(t)}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5",
              ].join(" ")}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="text-xs text-white/40">Right panel: context views</div>
    </div>
  );
}