/**
 * lib/db/prisma.ts
 *
 * Prisma ORM v7 change:
 * - When Prisma Client is generated with engine type "client", you MUST provide either:
 *   1) a Driver Adapter via { adapter }, OR
 *   2) an Accelerate URL via { accelerateUrl }.
 *
 * We are using a normal Postgres database (Docker) in local development.
 * Therefore we use the Postgres Driver Adapter:
 *   @prisma/adapter-pg  +  pg
 *
 * This file also implements a dev-safe singleton so Next.js hot reload
 * does not open many DB connections.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Create the adapter once.
 * IMPORTANT:
 * - PrismaPg expects a *direct* Postgres connection string.
 * - In our project, DATABASE_URL looks like:
 *   postgresql://postgres:postgres@localhost:5433/agustin_ml_hub?schema=public
 */
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

/**
 * In dev, cache PrismaClient globally to avoid connection storms during hot reload.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    /**
     * Prisma v7 requirement:
     * Provide adapter so the client-engine can connect to Postgres.
     */
    adapter,

    /**
     * Optional logging:
     * Enable temporarily when debugging DB behavior.
     */
    // log: ["query", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
