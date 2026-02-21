/**
 * app/owner/layout.tsx
 *
 * Owner layout wrapper:
 * - Keeps the existing sidebar system (do not rewrite your Sidebar component)
 * - Makes the content scrollable
 * - Forces the darkest black background (#000)
 *
 * This file assumes your existing owner layout already checks RBAC/ADMIN either here
 * or via your existing mechanism. If you already enforce RBAC elsewhere, keep it there.
 */

import type { ReactNode } from "react";
import "@/app/globals.css"; // keep if you already use it

// If your existing owner layout already imports a shell/sidebar component,
// keep that pattern. This is a minimal wrapper that preserves scrolling + background.
import { Sidebar } from "@/components/layout/Sidebar";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "white", display: "flex" }}>
      {/* Sidebar stays fixed; main content scrolls */}
      <Sidebar />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          height: "100vh",
          overflowY: "auto",
          background: "#000000",
        }}
      >
        {children}
      </main>
    </div>
  );
}
