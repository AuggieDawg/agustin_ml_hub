// components/owner/DataProfilerPanel.tsx
//
// Owner-only Data Profiler UI panel.
//
// Professional architecture (what this component assumes):
// - The browser uploads a CSV to YOUR Next.js API gateway endpoint:
//     POST /api/ml/profile
// - That route (app/api/ml/profile/route.ts) is responsible for:
//     1) verifying the user is signed in AND is authorized (ADMIN)
//     2) forwarding the CSV to the ML microservice container (localhost:8001 internally)
//     3) returning the profiling JSON back to the browser
//
// Why this architecture is the "clean long-term option":
// - The ML microservice stays private and never needs to be exposed to the public internet.
// - Auth & RBAC enforcement stays centralized in the Next.js application.
// - You can add rate limits, logging, auditing, and caching at the gateway.
// - You can later swap the ML service implementation without breaking the UI contract.
//
// IMPORTANT:
// - This component does NOT require you to create a new components/tools folder.
//   Your repo currently uses components/owner for owner-only widgets, so we follow that.
// - This component is intentionally "boring" and robust: correctness first, styling second.

"use client";

import { useMemo, useState } from "react";

type ProfileResponse = any;

/**
 * A small helper to print "human" file sizes (for UX and debugging).
 */
function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

export function DataProfilerPanel() {
  // Selected CSV file from the user.
  const [file, setFile] = useState<File | null>(null);

  // Busy state for button and interaction lock.
  const [busy, setBusy] = useState(false);

  // Error string to display if something fails.
  const [error, setError] = useState<string | null>(null);

  // Successful result payload from the profiler.
  const [result, setResult] = useState<ProfileResponse | null>(null);

  // Useful file metadata for display.
  const fileMeta = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      size: file.size,
      type: file.type || "unknown",
      lastModified: file.lastModified ? new Date(file.lastModified) : null,
    };
  }, [file]);

  /**
   * Upload CSV -> POST /api/ml/profile -> render JSON response
   *
   * Implementation details:
   * - Uses FormData for file upload, which is standard for browsers.
   * - We do not manually set Content-Type; the browser will include the multipart boundary.
   * - We handle both non-JSON error bodies and JSON bodies safely.
   */
  async function runProfiler() {
    if (!file) return;

    setBusy(true);
    setError(null);
    setResult(null);

    try {
      // Build multipart form payload.
      const form = new FormData();
      form.append("file", file);

      // Call the gateway route inside your Next.js app.
      // This route should be RBAC-protected (ADMIN) and forward to the ML service.
      const res = await fetch("/api/ml/profile", {
        method: "POST",
        body: form,
      });

      // If the gateway returns an error status, try to extract details for debugging.
      if (!res.ok) {
        // We try JSON first, then fall back to plain text.
        let detail = "";
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await res.json().catch(() => null);
          if (json && typeof json === "object") {
            detail =
              (json.error as string) ||
              (json.message as string) ||
              JSON.stringify(json);
          }
        } else {
          detail = await res.text().catch(() => "");
        }

        throw new Error(
          `Profiler failed (${res.status} ${res.statusText})${detail ? `: ${detail}` : ""}`
        );
      }

      // Success path: parse JSON response.
      const json = (await res.json()) as ProfileResponse;
      setResult(json);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  /**
   * Reset the panel state (useful for repeated profiling).
   */
  function reset() {
    setFile(null);
    setBusy(false);
    setError(null);
    setResult(null);
  }

  return (
    <section
      style={{
        padding: 16,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      {/* Header */}
      <div style={{ fontSize: 20, fontWeight: 950, letterSpacing: 0.2 }}>
        Data Profiler
      </div>
      <div style={{ color: "rgba(255,255,255,0.70)", marginTop: 6 }}>
        Upload a CSV to compute column types, missingness, basic statistics, and summary metadata.
        This runs in your ML microservice through your authenticated gateway.
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: 14,
          padding: 14,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(0,0,0,0.40)",
        }}
      >
        {/* File chooser */}
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ color: "rgba(255,255,255,0.85)" }}
        />

        {/* Run button */}
        <button
          onClick={runProfiler}
          disabled={!file || busy}
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background:
              "linear-gradient(135deg, rgba(255,0,80,0.28), rgba(255,255,255,0.03))",
            boxShadow: "inset 0 0 18px rgba(255,0,80,0.16)",
            color: "rgba(255,255,255,0.92)",
            cursor: !file || busy ? "not-allowed" : "pointer",
            fontWeight: 800,
          }}
          title={!file ? "Choose a CSV first" : "Run the profiler"}
        >
          {busy ? "Running..." : "Run Profiler"}
        </button>

        {/* Reset button */}
        <button
          onClick={reset}
          disabled={busy && !result}
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.85)",
            cursor: busy && !result ? "not-allowed" : "pointer",
            fontWeight: 750,
          }}
          title="Clear selection and results"
        >
          Reset
        </button>

        {/* Selected file metadata */}
        {fileMeta && (
          <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 12 }}>
            <div>
              <strong>File:</strong> {fileMeta.name}
            </div>
            <div>
              <strong>Size:</strong> {formatBytes(fileMeta.size)}{" "}
              <span style={{ marginLeft: 10 }}>
                <strong>Type:</strong> {fileMeta.type}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error block */}
      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 16,
            border: "1px solid rgba(255,120,120,0.35)",
            background: "rgba(255,0,0,0.08)",
            color: "rgba(255,180,180,0.95)",
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Profiler Error</div>
          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{error}</div>

          {/* Debug hint: most common failure mode is the ML container not running */}
          <div style={{ marginTop: 10, color: "rgba(255,200,200,0.85)", fontSize: 12 }}>
            Common causes: DB container stopped (auth fails), ML container stopped (gateway fails),
            or you uploaded a non-CSV file.
          </div>
        </div>
      )}

      {/* Result viewer */}
      {result && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Profiler Result (JSON)</div>
          <pre
            style={{
              padding: 14,
              borderRadius: 16,
              background: "rgba(0,0,0,0.70)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.85)",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
