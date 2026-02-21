"use client";

/**
 * components/cards/FlipCard.tsx
 *
 * 3D flip card:
 * - Click toggles rotateY(180deg)
 * - Optional image on front and/or back
 * - Taller card, larger centered image
 * - Red gradient background with black text
 *
 * Notes:
 * - Uses plain <img> so local JPEG/PNG/SVG all work (served from /public).
 * - If an image isn't showing, verify it is in /public and accessible via
 *   http://localhost:3000/<path>.
 */

import { useState } from "react";

type FlipCardProps = {
  title: string;
  frontText: string;
  backText: string;
  frontImageSrc?: string;
  backImageSrc?: string;
};

export function FlipCard({
  title,
  frontText,
  backText,
  frontImageSrc,
  backImageSrc,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  // More prominent + shiny red gradient
  const shinyRed = `
    radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55), rgba(255,255,255,0) 35%),
    linear-gradient(135deg, #ff2b2b 0%, #b30000 55%, #7a0000 100%)
  `;

  return (
    <button
      onClick={() => setFlipped((v) => !v)}
      style={{
        width: "100%",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
      }}
      aria-pressed={flipped}
      title="Click to flip"
    >
      {/* Perspective wrapper */}
      <div
        style={{
          perspective: 1200,
          width: "100%",
        }}
      >
        {/* Rotating inner card */}
        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: 320, // ✅ taller
            borderRadius: 18,
            transformStyle: "preserve-3d",
            transition: "transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
          }}
        >
          {/* FRONT */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              backfaceVisibility: "hidden",
              background: shinyRed,
              border: "1px solid rgba(0,0,0,0.25)",
              color: "#000",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>

            {/* Big centered image */}
            {frontImageSrc ? (
              <div style={{ display: "grid", placeItems: "center", flex: 1 }}>
                <img
                  src={frontImageSrc}
                  alt={`${title} image`}
                  style={{
                    width: 96, // ~2.5x your old 38
                    height: 96,
                    objectFit: "cover",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.20)",
                    border: "1px solid rgba(0,0,0,0.20)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                  }}
                />
              </div>
            ) : (
              <div style={{ flex: 1 }} />
            )}

            <div style={{ fontWeight: 650, opacity: 0.95 }}>{frontText}</div>

            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Click to flip →
            </div>
          </div>

          {/* BACK */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: shinyRed,
              border: "1px solid rgba(0,0,0,0.25)",
              color: "#000",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>

            {backImageSrc ? (
              <div style={{ display: "grid", placeItems: "center", flex: 1 }}>
                <img
                  src={backImageSrc}
                  alt={`${title} back image`}
                  style={{
                    width: 96,
                    height: 96,
                    objectFit: "cover",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.20)",
                    border: "1px solid rgba(0,0,0,0.20)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                  }}
                />
              </div>
            ) : (
              <div style={{ flex: 1 }} />
            )}

            <div style={{ fontWeight: 650, opacity: 0.95 }}>{backText}</div>

            <div style={{ fontSize: 12, opacity: 0.75 }}>
              ← Click to flip back
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
