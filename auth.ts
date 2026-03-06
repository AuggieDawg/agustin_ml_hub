// auth.ts (repo root)
//
// This project is using NextAuth v4 (next-auth@4.x).
// The canonical config lives in: /lib/auth/auth.ts
// The App Router auth route is: /app/api/auth/[...nextauth]/route.ts
//
// This file exists only as a safe shim so nothing accidentally imports a v5-style config.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export { authOptions };

/**
 * v4-compatible session helper.
 * Usage (server / route handlers): const session = await auth();
 */
export function auth() {
  return getServerSession(authOptions);
}