/**
 * scripts/make-admin.ts
 *
 * Promote an existing user to ADMIN (owner portal access).
 *
 * Key points (Prisma v7 in this repo):
 * - Your Prisma Client is generated with engine type "client".
 * - That requires constructing PrismaClient with either:
 *   1) a Driver Adapter (`adapter`) OR
 *   2) an Accelerate URL (`accelerateUrl`)
 *
 * We are using a local Docker Postgres database, so we use the Postgres driver adapter:
 *   @prisma/adapter-pg + pg
 *
 * Also:
 * - Next.js loads `.env` automatically when running `next dev`.
 * - A standalone script (`ts-node`) does NOT automatically load `.env`.
 * - So we load `.env` via `dotenv/config`.
 *
 * Usage:
 *   npx ts-node scripts/make-admin.ts "you@example.com"
 */

import "dotenv/config"; // Loads .env into process.env for this script run

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Validate required env var early (fail fast with a clear message)
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || DATABASE_URL.trim().length === 0) {
  throw new Error(
    'DATABASE_URL is missing. Ensure it exists in .env and points to localhost:5433 (Docker Postgres).'
  );
}

/**
 * Prisma v7 requirement for client-engine:
 * Construct PrismaClient with a driver adapter.
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

async function main() {
  const email = process.argv[2];
  if (!email) {
    throw new Error('Usage: npx ts-node scripts/make-admin.ts "you@example.com"');
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`Updated ${user.email} -> role=${user.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
