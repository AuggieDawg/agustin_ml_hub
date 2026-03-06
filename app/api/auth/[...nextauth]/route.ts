/**
 * app/api/auth/[...nextauth]/route.ts
 *
 * Next.js App Router API route for NextAuth v4.
 *
 * Key concept:
 * - In v4, `NextAuth(authOptions)` returns a *single handler function*.
 * - Next.js expects named exports for HTTP verbs, so we export it as GET/POST.
 *
 * This route powers:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/google
 * - /api/auth/session
 */

import NextAuth from "next-auth";
import { authOptions } from "@/auth";

/**
 * The handler function returned by NextAuth implements the entire /api/auth/*
 * endpoint surface area.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
