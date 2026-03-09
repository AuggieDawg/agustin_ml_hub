"use client";

import TasksPanel from "@/components/tasks/TasksPanel";

export default function ClientDashboard() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background:
          "radial-gradient(circle at top, rgba(50,70,120,0.24), transparent 30%), #050505",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        <section
          style={{
            padding: 24,
            borderRadius: 24,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: 0.2,
              marginBottom: 8,
            }}
          >
            Client Center
          </div>

          <div
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 900,
            }}
          >
            Manage client-facing tasks, track operations, and grow this page into
            the dedicated client command center.
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {["Active Tasks", "ML Insights", "System Health"].map((label) => (
            <div
              key={label}
              style={{
                padding: 18,
                borderRadius: 20,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <div
                style={{
                  color: "rgba(255,255,255,0.62)",
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 8,
                }}
              >
                {label}
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                }}
              >
                —
              </div>
            </div>
          ))}
        </section>

        <TasksPanel scope="client" label="Client Tasks" />
      </div>
    </div>
  );
}