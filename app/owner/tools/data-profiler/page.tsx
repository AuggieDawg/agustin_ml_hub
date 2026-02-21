// app/owner/tools/data-profiler/page.tsx
//
// Owner Tool Page: Data Profiler
//
// Route:
//   /owner/tools/data-profiler
//
// Purpose:
// - Renders the owner-only Data Profiler UI.
// - The UI uploads a CSV to the Next.js gateway endpoint:
//     POST /api/ml/profile
// - The gateway forwards the file to the ML microservice and returns JSON.
//
// Notes:
// - This page is a Server Component by default (recommended).
// - The actual interactive UI is in a Client Component: DataProfilerPanel.

import { DataProfilerPanel } from "@/components/owner/DataProfilerPanel";

export default function DataProfilerPage() {
  return (
    <div style={{ padding: 18, color: "white" }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 28, fontWeight: 950, letterSpacing: 0.2 }}>
          Data Profiler
        </div>

        <div style={{ color: "rgba(255,255,255,0.70)", marginTop: 6 }}>
          Owner-only tool. Upload a CSV and validate dataset structure before feature engineering
          or modeling.
        </div>
      </div>

      <DataProfilerPanel />
    </div>
  );
}
