/**
 * lib/auth/rbac.ts
 *
 * Purpose:
 * - Provide reusable authorization checks.
 * - Keep authorization logic out of pages/routes as much as possible.
 *
 * We start with a single rule:
 * - ADMIN can access /owner/*
 *
 * Later we can expand to:
 * - granular permissions per tool
 * - feature flags
 * - per-object access control lists (ACLs)
 */

import type { Role } from "@prisma/client";

/**
 * Minimal role check.
 * In the future, you could replace this with a more flexible permission system.
 */
export function isAdmin(role: Role | string | undefined | null): boolean {
  return role === "ADMIN";
}
