// components/owner/OwnerDashboard.tsx
//
// OwnerDashboard = the main "owner portal" dashboard surface.
//
// Goals of this file (professional intent):
// 1) Present a high-signal operational overview for YOU (the owner).
// 2) Keep the UI modular: each section is either a component or can become one.
// 3) Make the "Tools" section registry-driven, so tools are not hard-coded.
//    - Adding a new tool becomes: add one object in lib/tools/registry.ts
//    - The dashboard automatically renders it (and links to its href if provided).
//
// NOTE:
// - This file uses inline styles (matching your current codebase pattern).
// - We assume your /owner route is already protected by auth (redirect to sign-in).
// - We do NOT change auth behavior here; this file is purely UI composition.

import Link from "next/link";
import { TOOL_REGISTRY } from "@/lib/tools/registry";
import { TasksPanel } from "@/components/tasks/TasksPanel";

/**
 * Utility: a consistent "glass" panel style.
 * This is used to keep the owner dashboard cohesive.
 */
function glassCardStyle() {
  return {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  } as const;
}

/**
 * Utility: title styling for sections.
 */
function sectionTitleStyle() {
  return {
    fontSize: 16,
    fontWeight: 900,
    letterSpacing: 0.3,
    color: "rgba(255,255,255,0.92)",
  } as const;
}

/**
 * Utility: subtle text (used for hints, captions, and secondary labels).
 */
function subtleText() {
  return {
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    lineHeight: 1.45,
  } as const;
}

/**
 * Utility: helper to standardize small KPI cards.
 */
function kpiCardStyle() {
  return {
    ...glassCardStyle(),
    padding: 14,
    minHeight: 88,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  } as const;
}

/**
 * OwnerDashboard component
 *
 * Render model:
 * - A top-level grid with:
 *   - Left / main column: operational sections + tasks
 *   - Right column: KPI quick stats + profile summary (future)
 *
 * Critical behavior:
 * - Tools section is registry-driven and navigation-safe.
 * - TasksPanel is reused for owner tasks by setting `scope="owner"`.
 *   (This assumes your TasksPanel already supports owner vs public scoping.)
 */
export default function OwnerDashboard() {
  // Owner-visible tools, pulled from the single source of truth registry.
  // This prevents drift between what the owner sees and what you actually support.
  const ownerTools = TOOL_REGISTRY.filter((t) => t.visibility === "owner");

  return (
    <div
      style={{
        // Darkest possible background requested.
        background: "#000000",
        minHeight: "100vh",
        padding: 18,
        color: "white",
      }}
    >
      {/* Page header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 950, letterSpacing: 0.2 }}>
            Owner Portal
          </div>
          <div style={{ ...subtleText(), marginTop: 4 }}>
            Operational dashboard + private ML tools + owner-only tasks.
          </div>
        </div>

        {/* Right-side header actions (future)
            Keep this area reserved for: notifications, quick actions, environment indicator, etc.
         */}
        <div style={{ display: "flex", gap: 10 }}>
          <div
            style={{
              padding: "8px 10px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              ...subtleText(),
            }}
            title="Environment hint (dev/prod later)"
          >
            Environment: dev
          </div>
        </div>
      </header>

      {/* Main layout grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 360px",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: primary content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Tools section (REGISTRY-DRIVEN) */}
          <section style={{ ...glassCardStyle(), padding: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                alignItems: "baseline",
              }}
            >
              <div style={sectionTitleStyle()}>Tools</div>
              <div style={subtleText()}>
                Owner-only tools (registry-driven)
              </div>
            </div>

            {/* Tools grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              {ownerTools.map((t) => {
                // Tool “card” visuals: red gradient + subtle gloss effect
                // (You requested red gradient with dark text previously for flip cards;
                // here we keep owner tools consistent with the owner aesthetic.)
                const card = (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 18,
                      background:
                        "linear-gradient(135deg, rgba(255,0,80,0.26), rgba(255,255,255,0.03))",
                      border: "1px solid rgba(255,255,255,0.10)",
                      boxShadow:
                        "inset 0 0 26px rgba(255,0,80,0.18), 0 10px 26px rgba(0,0,0,0.35)",
                      minHeight: 120,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      cursor: t.href ? "pointer" : "default",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* “Gloss” overlay: subtle highlight band */}
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: -40,
                        left: -40,
                        width: 180,
                        height: 180,
                        background:
                          "radial-gradient(circle, rgba(255,255,255,0.18), rgba(255,255,255,0.0) 70%)",
                        transform: "rotate(20deg)",
                      }}
                    />

                    <div style={{ position: "relative" }}>
                      <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>
                        {t.title}
                      </div>
                      <div style={{ ...subtleText(), marginTop: 8 }}>
                        {t.frontText}
                      </div>
                    </div>

                    {/* If there is an href, show a subtle affordance */}
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        color: "rgba(255,255,255,0.70)",
                        position: "relative",
                      }}
                    >
                      {t.href ? "Open tool →" : "Coming soon"}
                    </div>
                  </div>
                );

                // If the tool has a route, wrap it in a Next.js Link for navigation.
                // Otherwise render as a static card.
                return t.href ? (
                  <Link
                    key={t.id}
                    href={t.href}
                    style={{ textDecoration: "none" }}
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={t.id}>{card}</div>
                );
              })}
            </div>
          </section>

          {/* Owner tasks section
              IMPORTANT:
              - We reuse the existing TasksPanel component to avoid duplication.
              - It must be configured to call the owner tasks API (app/api/owner-tasks/*),
                not the user tasks API (app/api/tasks/*).
              - If your current TasksPanel already supports this, keep scope="owner".
              - If it does not, tell me and I’ll give you the updated TasksPanel too.
           */}
          <section style={{ ...glassCardStyle(), padding: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                alignItems: "baseline",
              }}
            >
              <div style={sectionTitleStyle()}>Owner Tasks</div>
              <div style={subtleText()}>
                Private tasks (separate from portal users)
              </div>
            </div>

            {/* Reuse your existing task UI */}
            <TasksPanel scope="owner" />
          </section>
        </div>

        {/* RIGHT COLUMN: KPI / profile / status */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <div style={kpiCardStyle()}>
              <div style={subtleText()}>System</div>
              <div style={{ fontSize: 18, fontWeight: 950 }}>Online</div>
              <div style={subtleText()}>
                DB + ML service expected running in Docker.
              </div>
            </div>

            <div style={kpiCardStyle()}>
              <div style={subtleText()}>Security</div>
              <div style={{ fontSize: 18, fontWeight: 950 }}>RBAC Active</div>
              <div style={subtleText()}>
                Owner routes gated; API authorization enforced.
              </div>
            </div>

            <div style={kpiCardStyle()}>
              <div style={subtleText()}>ML Service</div>
              <div style={{ fontSize: 18, fontWeight: 950 }}>Health OK</div>
              <div style={subtleText()}>
                /api/ml/health should return status.
              </div>
            </div>
          </div>

          {/* Profile summary placeholder (we’ll wire real user profile later) */}
          <section style={{ ...glassCardStyle(), padding: 14 }}>
            <div style={{ ...sectionTitleStyle(), marginBottom: 10 }}>
              Owner Profile
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* Placeholder image slot:
                  Replace src with your profile image under /public/icons/...
               */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                }}
                title="Profile image slot"
              >
                A
              </div>

              <div>
                <div style={{ fontWeight: 900 }}>Agustin (Owner)</div>
                <div style={subtleText()}>Admin role</div>
              </div>
            </div>

            <div style={{ marginTop: 12, ...subtleText() }}>
              Next: allow uploading/changing profile picture and storing it on the user record.
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
