/**
 * middleware.ts
 *
 * Purpose:
 * - Enforce RBAC at the routing layer.
 *
 * Why this matters:
 * - UI-only gating is not security.
 * - Middleware blocks the request before the page loads.
 *
 * Scope:
 * - Only runs for routes matched in `config.matcher`.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { isAdmin } from "@/lib/auth/rbac";

export async function middleware(req: NextRequest) {
  /**
   * Auth.js provides `auth()` to retrieve the current session server-side.
   * If no session exists, the user is unauthenticated.
   */
  const session = await auth();

  // Not logged in -> redirect to sign-in flow
  if (!session?.user) {
    const url = new URL("/api/auth/signin", req.url);
    return NextResponse.redirect(url);
  }

  /**
   * We attached role in the session callback.
   * If you ever remove that callback, this will stop working.
   */
  const role = (session.user as any).role;

  // Logged in but not ADMIN -> forbid access
  if (!isAdmin(role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Allowed -> continue
  return NextResponse.next();
}

export const config = {
  /**
   * Apply middleware only to owner/admin routes.
   * Keeps performance and complexity controlled.
   */
  matcher: ["/owner/:path*"],
};
