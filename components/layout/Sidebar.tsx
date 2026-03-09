import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/client", label: "Client" },
  { href: "/workbench", label: "Workbench" },
  { href: "/owner", label: "ML Center" },
];

export function Sidebar() {
  return (
    <aside
      style={{
        width: 240,
        borderRight: "1px solid rgba(255,255,255,0.08)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        background: "#050505",
        color: "white",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 18,
          letterSpacing: 0.3,
          marginBottom: 6,
        }}
      >
        Agustin ML Hub
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              color: "rgba(255,255,255,0.88)",
              textDecoration: "none",
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontWeight: 600,
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}