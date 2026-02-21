/**
 * app/api/ml/health/route.ts
 *
 * Secure gateway health check for the ML service.
 * - Requires an authenticated session.
 * - Calls the ML service /health endpoint.
 *
 * Why this exists (architecturally):
 * - Browser should NOT hit ML service directly.
 * - Next.js API is the control plane: auth + RBAC + validation + auditing.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

// IMPORTANT: If your auth options export name differs, adjust this import.
import { authOptions } from "@/lib/auth/auth";

export const runtime = "nodejs";

export async function GET() {
  // 1) Require authentication (prevents exposing internal health to anonymous users)
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Resolve ML service base URL from env
  const baseUrl = process.env.ML_SERVICE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "ML_SERVICE_URL is not set in .env" },
      { status: 500 }
    );
  }

  // 3) Proxy request to ML service
  const res = await fetch(`${baseUrl}/health`, { method: "GET" });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(
      { error: "ML service unhealthy", detail: data },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, ml: data });
}
