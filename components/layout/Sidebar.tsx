/**
 * components/layout/Sidebar.tsx
 *
 * Minimal, dependency-free sidebar.
 * We’re intentionally keeping styling basic until functionality is proven.
 *
 * Later upgrades:
 * - Tailwind styling
 * - active route highlight
 * - collapsible groups
 */

import Link from "next/link";

export function Sidebar() {
  return (
    <aside
      style={{
        width: 220,
        borderRight: "1px solid #ddd",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 700 }}>Agustin ML Hub</div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Link href="/">Home</Link>
        <Link href="/portal">User Portal</Link>
        <Link href="/owner">Owner Portal</Link>
      </nav>
    </aside>
  );
}
