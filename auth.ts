import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient singleton for dev:
 * Prevents creating a new DB connection on every hot reload.
 * This becomes important once you run the Next.js dev server continuously.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Optional for debugging:
    // log: ["query", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Central Auth.js configuration used across the project.
 * - `handlers` provides Next.js route handlers for /api/auth/*
 * - `auth` is used by middleware and server code to retrieve the current session
 */
export const { auth, handlers } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  /**
   * DB sessions:
   * - sessions persist in Postgres
   * - easy to revoke
   * - aligns with enterprise patterns
   */
  session: { strategy: "database" },

  callbacks: {
    /**
     * Enrich session.user with critical fields.
     * - `id`: required to scope DB queries to the logged-in user
     * - `role`: required for RBAC
     */
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role;
      }
      return session;
    },
  },
});
