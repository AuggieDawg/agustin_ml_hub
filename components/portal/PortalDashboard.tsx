"use client";

import TasksPanel from "@/components/tasks/TasksPanel";

/**
 * PortalDashboard
 *
 * Uses hero.png as background
 * Glass UI
 * Business dashboard layout
 */

export default function PortalDashboard() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/icons/hero.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        padding: "40px 32px",
      }}
    >
      {/* Overlay for readability */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          backdropFilter: "blur(18px)",
          background: "rgba(0,0,0,0.65)",
          borderRadius: 24,
          padding: 32,
          border: "1px solid rgba(120,140,255,0.2)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        }}
      >
        <h1
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: "#6f88ff",
            marginBottom: 8,
          }}
        >
          Client Dashboard
        </h1>

        <p style={{ color: "rgba(200,210,255,0.8)", marginBottom: 32 }}>
          Manage tasks, track operations, and monitor ML-powered insights.
        </p>

        {/* KPI Row (future ready) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 40,
          }}
        >
          {["Active Tasks", "ML Insights", "System Health"].map((label) => (
            <div
              key={label}
              style={{
                padding: 20,
                borderRadius: 18,
                background:
                  "linear-gradient(135deg, rgba(63,107,255,0.3), rgba(32,214,164,0.25))",
                border: "1px solid rgba(120,140,255,0.3)",
                color: "white",
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Tasks */}
        <TasksPanel />
      </div>
    </div>
  );
}
