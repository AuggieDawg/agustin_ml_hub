"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HeroScene from "@/components/home/HeroScene";

/**
 * components/home/LandingHero.tsx
 *
 * - Black space background (page-level)
 * - Real 3D scene behind content
 * - Content uses a glass panel (dark glass) so text reads over the stars
 * - Buttons remain: Sign In, Portal, Owner
 */

type Feature = { title: string; subtitle: string };

const FEATURES: Feature[] = [
  { title: "Automated MLOps", subtitle: "Streamline your machine learning workflows" },
  { title: "Data Security & Compliance", subtitle: "Keep your data and systems secure" },
  { title: "Advanced Backup & Recovery", subtitle: "Safeguard critical data with rapid disaster recovery" },
  { title: "Seamless Integration", subtitle: "Integrate with your existing IT and ML stack" },
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

  // Neon-ish ink colors that read well on black
  const ink = "#cfe0ff";
  const inkSoft = "rgba(207, 224, 255, 0.72)";
  const accent = "rgba(80, 160, 255, 0.95)";
  const border = "rgba(120, 180, 255, 0.16)";

  return (
    <div
      style={{
        minHeight: "140vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(1000px 700px at 30% 25%, rgba(74, 86, 255, 0.14), rgba(0,0,0,0)), #000000",
      }}
    >
      {/* 3D background */}
      <HeroScene scrollK={scrollK} />

      {/* Optional: very subtle dark overlay to unify contrast */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.28) 60%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Top Nav */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            backdropFilter: "blur(16px)",
            background: "rgba(0,0,0,0.35)",
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                aria-hidden
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(80,160,255,0.95), rgba(40,214,164,0.75))",
                  boxShadow: "0 12px 26px rgba(80,160,255,0.25)",
                }}
              />
              <div style={{ fontWeight: 950, letterSpacing: 0.2, color: ink }}>ML Hub</div>
            </div>

            <div style={{ display: "flex", gap: 16, fontWeight: 750, color: "rgba(207,224,255,0.55)" }}>
              <span>Dashboard</span>
              <span>Reports</span>
              <span>Assets</span>
              <span>…</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href="/api/auth/signin"
                style={{
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${border}`,
                  color: ink,
                  fontWeight: 900,
                }}
              >
                Sign In
              </Link>

              <Link
                href="/portal"
                style={{
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${border}`,
                  color: ink,
                  fontWeight: 900,
                }}
              >
                Portal
              </Link>

              <Link
                href="/owner"
                style={{
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(80,160,255,0.95), rgba(40,214,164,0.80))",
                  border: "1px solid rgba(80,160,255,0.18)",
                  color: "#001018",
                  fontWeight: 950,
                  boxShadow: "0 14px 28px rgba(80,160,255,0.25)",
                }}
              >
                Owner
              </Link>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 18px" }}>
          <div
            style={{
              padding: "30px 28px",
              borderRadius: 24,
              background: "rgba(0,0,0,0.45)",
              border: `1px solid ${border}`,
              boxShadow: "0 28px 90px rgba(0,0,0,0.55)",
              maxWidth: 780,
            }}
          >
            <div style={{ fontSize: 56, lineHeight: 1.02, fontWeight: 1000, letterSpacing: -0.6, color: ink }}>
              Optimize & Protect
              <br />
              Your IT Environment
            </div>

            <div style={{ marginTop: 14, fontSize: 16, lineHeight: 1.55, color: inkSoft, fontWeight: 650 }}>
              Sleek 3D hero (glass cube + gradient rings + starfield) built on your existing auth, database, and ML tools.
            </div>

            <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                href="/api/auth/signin"
                style={{
                  textDecoration: "none",
                  padding: "12px 16px",
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${accent}, rgba(40,214,164,0.88))`,
                  color: "#001018",
                  fontWeight: 950,
                  boxShadow: "0 14px 28px rgba(80,160,255,0.25)",
                }}
              >
                Get Started
              </Link>

              <Link
                href="/portal"
                style={{
                  textDecoration: "none",
                  padding: "12px 16px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${border}`,
                  color: ink,
                  fontWeight: 950,
                }}
              >
                View Live Demo
              </Link>

              <Link
                href="/owner"
                style={{
                  textDecoration: "none",
                  padding: "12px 16px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${border}`,
                  color: ink,
                  fontWeight: 950,
                }}
              >
                Owner Portal
              </Link>
            </div>
          </div>

          {/* Feature cards */}
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: "16px 16px",
                  borderRadius: 18,
                  background: "rgba(0,0,0,0.35)",
                  border: `1px solid ${border}`,
                  boxShadow: "0 18px 40px rgba(0,0,0,0.40)",
                }}
              >
                <div style={{ fontWeight: 950, fontSize: 18, color: ink }}>{f.title}</div>
                <div style={{ marginTop: 6, color: inkSoft, fontSize: 13, fontWeight: 650 }}>{f.subtitle}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 260 }} />
      </div>
    </div>
  );
}
