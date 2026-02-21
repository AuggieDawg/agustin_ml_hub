/**
 * app/api/ml/profile/route.ts
 *
 * Secure gateway endpoint for "Dataset Profiler" tool.
 * - Requires auth session
 * - Requires ADMIN role (owner-only tool)
 * - Accepts multipart/form-data with "file" (CSV)
 * - Forwards to ML service /profile
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";

export const runtime = "nodejs";

// Simple admin check. We keep it local to avoid depending on unknown rbac.ts exports.
// Later we can centralize this into lib/auth/rbac.ts if you want.
function isAdmin(session: any) {
  return (session?.user as any)?.role === "ADMIN";
}

export async function POST(req: Request) {
  // 1) Auth
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) RBAC: owner-only tool
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3) Env
  const baseUrl = process.env.ML_SERVICE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "ML_SERVICE_URL is not set in .env" },
      { status: 500 }
    );
  }

  // 4) Parse upload
  const form = await req.formData();
  const file = form.get("file");

  // In Next.js/Node, uploaded files come through as File objects.
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing "file" in multipart form data' },
      { status: 400 }
    );
  }

  // 5) Basic size guard (keep it conservative early on)
  // You can increase this later as you add streaming/sampling.
  const maxBytes = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: "File too large (max 10MB for now)" },
      { status: 413 }
    );
  }

  // 6) Forward upload to ML service
  const forward = new FormData();
  forward.append("file", file, file.name);

  const res = await fetch(`${baseUrl}/profile`, {
    method: "POST",
    body: forward,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(
      { error: "ML profile failed", detail: data },
      { status: 502 }
    );
  }

  return NextResponse.json(data);
}
