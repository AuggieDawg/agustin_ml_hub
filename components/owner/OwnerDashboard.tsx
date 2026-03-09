import Link from "next/link";
import TasksPanel from "@/components/tasks/TasksPanel";
import { TOOL_REGISTRY } from "@/lib/tools/registry";

function glassCardStyle() {
  return {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  } as const;
}

function sectionTitleStyle() {
  return {
    fontSize: 16,
    fontWeight: 900,
    letterSpacing: 0.3,
    color: "rgba(255,255,255,0.92)",
  } as const;
}

function subtleText() {
  return {
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    lineHeight: 1.45,
  } as const;
}

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

export default function OwnerDashboard() {
  const ownerTools = TOOL_REGISTRY.filter((t) => t.visibility === "owner");

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background:
          "radial-gradient(circle at top, rgba(105,35,35,0.22), transparent 28%), #050505",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          display: "grid",
          gap: 22,
        }}
      >
        <div
          style={{
            ...glassCardStyle(),
            padding: 22,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 950,
                letterSpacing: -0.8,
                marginBottom: 8,
              }}
            >
              ML Center
            </div>

            <div style={{ ...subtleText(), maxWidth: 780 }}>
              Operational dashboard for your private machine learning tools,
              experiments, analysis workflows, and owner-only tasks.
            </div>
          </div>

          <div
            style={{
              ...glassCardStyle(),
              padding: "10px 14px",
              minWidth: 170,
            }}
          >
            <div style={{ ...subtleText(), marginBottom: 6 }}>Environment</div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>dev</div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.7fr) minmax(320px, 0.8fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 20 }}>
            <section style={{ ...glassCardStyle(), padding: 20 }}>
              <div style={{ ...sectionTitleStyle(), marginBottom: 6 }}>Tools</div>
              <div style={{ ...subtleText(), marginBottom: 18 }}>
                Owner-only ML and data tooling driven from the central tool registry.
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 14,
                }}
              >
                {ownerTools.map((t) => {
                  const card = (
                    <div
                      style={{
                        position: "relative",
                        minHeight: 170,
                        borderRadius: 18,
                        overflow: "hidden",
                        padding: 18,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background:
                          "linear-gradient(180deg, rgba(170,40,40,0.28), rgba(20,20,20,0.8))",
                        boxShadow: "0 18px 36px rgba(0,0,0,0.28)",
                        color: "white",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.08), transparent 38%)",
                          pointerEvents: "none",
                        }}
                      />

                      <div
                        style={{
                          position: "relative",
                          display: "grid",
                          gap: 10,
                          height: "100%",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: 18,
                            letterSpacing: 0.2,
                          }}
                        >
                          {t.title}
                        </div>

                        <div style={{ ...subtleText(), color: "rgba(255,255,255,0.82)" }}>
                          {t.frontText}
                        </div>

                        <div
                          style={{
                            marginTop: "auto",
                            fontWeight: 800,
                            color: "rgba(255,255,255,0.92)",
                          }}
                        >
                          {t.href ? "Open tool →" : "Coming soon"}
                        </div>
                      </div>
                    </div>
                  );

                  return t.href ? (
                    <Link
                      key={t.id}
                      href={t.href}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {card}
                    </Link>
                  ) : (
                    <div key={t.id}>{card}</div>
                  );
                })}
              </div>
            </section>

            <section style={{ ...glassCardStyle(), padding: 20 }}>
              <div style={{ ...sectionTitleStyle(), marginBottom: 6 }}>
                Owner Tasks
              </div>
              <div style={{ ...subtleText(), marginBottom: 16 }}>
                Private tasks for the ML center and owner operations.
              </div>

              <TasksPanel scope="owner" label="Owner Tasks" />
            </section>
          </div>

          <aside style={{ display: "grid", gap: 14 }}>
            <div style={kpiCardStyle()}>
              <div style={subtleText()}>System</div>
              <div style={{ fontWeight: 900, fontSize: 22 }}>Online</div>
              <div style={subtleText()}>DB + app runtime expected active.</div>
            </div>

            <div style={kpiCardStyle()}>
              <div style={subtleText()}>Security</div>
              <div style={{ fontWeight: 900, fontSize: 22 }}>RBAC Active</div>
              <div style={subtleText()}>Admin routes gated at the layout boundary.</div>
            </div>

            <div style={kpiCardStyle()}>
              <div style={subtleText()}>ML Service</div>
              <div style={{ fontWeight: 900, fontSize: 22 }}>Health OK</div>
              <div style={subtleText()}>`/api/ml` should return a live response.</div>
            </div>

            <div style={{ ...glassCardStyle(), padding: 18 }}>
              <div style={{ ...sectionTitleStyle(), marginBottom: 14 }}>
                Owner Profile
              </div>

              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  fontWeight: 900,
                  fontSize: 24,
                  marginBottom: 14,
                }}
              >
                A
              </div>

              <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>
                Agustin
              </div>
              <div style={subtleText()}>Admin role</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}