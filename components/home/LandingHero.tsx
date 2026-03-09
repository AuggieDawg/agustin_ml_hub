"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import HeroScene from "@/components/home/HeroScene";

type Feature = {
  title: string;
  subtitle: string;
};

const FEATURES: Feature[] = [
  {
    title: "Automated MLOps",
    subtitle: "Streamline machine learning workflows across your stack.",
  },
  {
    title: "Data Security & Compliance",
    subtitle: "Build with stronger operational control and cleaner boundaries.",
  },
  {
    title: "Advanced Backup & Recovery",
    subtitle: "Protect critical business and application data.",
  },
  {
    title: "Seamless Integration",
    subtitle: "Unify your app, database, and ML tools into one platform.",
  },
];

export default function LandingHero() {
  const [scrollK, setScrollK] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        setScrollK(Math.max(0, Math.min(1, y / 900)));
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ink = "#cfe0ff";
  const inkSoft = "rgba(207, 224, 255, 0.72)";
  const accent = "rgba(80, 160, 255, 0.95)";
  const border = "rgba(120, 180, 255, 0.16)";

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "white",
        background:
          "radial-gradient(circle at top, rgba(60,90,160,0.18), transparent 28%), #030303",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
          background: "rgba(3,3,3,0.55)",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: 20,
              letterSpacing: 0.3,
              color: ink,
            }}
          >
            ML Hub
          </div>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={navLinkStyle}>
              Home
            </Link>
            <Link href="/client" style={navLinkStyle}>
              Client
            </Link>
            <Link href="/workbench" style={navLinkStyle}>
              Workbench
            </Link>
            <Link href="/owner" style={navLinkStyle}>
              ML Center
            </Link>
            <Link href="/api/auth/signin" style={buttonStyle(accent)}>
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "40px 24px 80px",
          display: "grid",
          gridTemplateColumns: "1.15fr 1fr",
          gap: 32,
          alignItems: "center",
        }}
      >
        <section style={{ display: "grid", gap: 22 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              width: "fit-content",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 999,
              border: `1px solid ${border}`,
              background: "rgba(255,255,255,0.03)",
              color: inkSoft,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 0.3,
            }}
          >
            Admin command centers + client systems + ML tooling
          </div>

          <div
            style={{
              fontSize: "clamp(40px, 7vw, 76px)",
              lineHeight: 0.95,
              fontWeight: 950,
              letterSpacing: -1.8,
              color: "white",
              maxWidth: 820,
            }}
          >
            Build a stronger business operating system.
          </div>

          <div
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.74)",
              maxWidth: 760,
            }}
          >
            A polished foundation for client operations, admin workbench control,
            and ML-centered owner tooling — all inside one system.
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              paddingTop: 6,
            }}
          >
            <Link href="/client" style={buttonStyle(accent)}>
              Open Client
            </Link>
            <Link href="/workbench" style={buttonStyle("rgba(255,255,255,0.08)")}>
              Open Workbench
            </Link>
            <Link href="/owner" style={buttonStyle("rgba(255,255,255,0.08)")}>
              Open ML Center
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
              paddingTop: 10,
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: 18,
                  borderRadius: 20,
                  border: `1px solid ${border}`,
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: "white",
                    marginBottom: 6,
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.68)",
                    lineHeight: 1.6,
                    fontSize: 14,
                  }}
                >
                  {f.subtitle}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            minHeight: 580,
            borderRadius: 28,
            overflow: "hidden",
            border: `1px solid ${border}`,
            background: "rgba(255,255,255,0.02)",
            boxShadow: `0 30px 100px rgba(0,0,0,${0.25 + scrollK * 0.15})`,
          }}
        >
          <HeroScene scrollK={scrollK} />
        </section>
      </main>
    </div>
  );
}

const navLinkStyle: CSSProperties = {
  color: "rgba(255,255,255,0.82)",
  textDecoration: "none",
  fontWeight: 700,
  padding: "10px 12px",
  borderRadius: 12,
};

function buttonStyle(background: string): CSSProperties {
  return {
    color: "white",
    textDecoration: "none",
    fontWeight: 800,
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
}