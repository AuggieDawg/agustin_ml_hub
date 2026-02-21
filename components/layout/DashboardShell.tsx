import { Sidebar } from "@/components/layout/Sidebar";
import { ProfileBadge } from "@/components/auth/ProfileBadge";

type DashboardShellProps = {
  title: string;
  children: React.ReactNode;
};

export function DashboardShell({ title, children }: DashboardShellProps) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <h1 style={{ margin: 0 }}>{title}</h1>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <ProfileBadge />
            <nav style={{ display: "flex", gap: 12 }}>
              <a href="/api/auth/signin">Sign in</a>
              <a href="/api/auth/signout">Sign out</a>
            </nav>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
