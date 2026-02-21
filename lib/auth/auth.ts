/**
 * lib/auth/auth.ts
 *
 * NextAuth v4 configuration file.
 *
 * Why this exists:
 * - Centralizes auth configuration (providers, adapter, session strategy)
 * - Keeps route handlers thin and consistent
 *
 * IMPORTANT:
 * - In NextAuth v4, you export `authOptions` (NOT `handlers`).
 * - The API route creates the handler with `NextAuth(authOptions)`.
 */

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { prisma } from "@/lib/db/prisma";

/**
 * `authOptions` is the canonical NextAuth v4 config object.
 * The adapter stores users, sessions, and accounts in Postgres via Prisma models.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      /**
       * Google OAuth credentials from your .env.
       * If these are missing, NextAuth will error during provider init.
       */
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  /**
   * Database sessions are the professional default for admin portals:
   * - server-side revocation is possible
   * - session state is explicit
   */
  session: {
    strategy: "database",
  },

  callbacks: {
    /**
     * Enrich session.user with user id + role for:
     * - RBAC (ADMIN for /owner)
     * - scoping user-owned objects (tasks, etc.)
     *
     * Note:
     * - NextAuth v4 session typing is intentionally conservative.
     * - We'll later add module augmentation to type this cleanly.
     */
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role;
      }
      return session;
    },
  },
};
