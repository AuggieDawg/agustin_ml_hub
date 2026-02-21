"use client";

/**
 * components/layout/TopTabs.tsx
 *
 * Simple tab bar.
 * We keep this component "controlled" via props:
 * - tabs: list of tab labels
 * - active: currently selected tab
 * - onChange: callback when user clicks a tab
 *
 * Later we can:
 * - add routing integration
 * - add keyboard navigation
 */

type TopTabsProps = {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
};

export function TopTabs({ tabs, active, onChange }: TopTabsProps) {
  return (
    <div style={{ display: "flex", gap: 10, borderBottom: "1px solid #ddd" }}>
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              padding: "10px 12px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontWeight: isActive ? 700 : 400,
              borderBottom: isActive ? "3px solid black" : "3px solid transparent",
            }}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
