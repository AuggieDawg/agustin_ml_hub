import type { Role } from "@prisma/client";

export type AppRole = Role | string | null | undefined;

export function isAdmin(role: AppRole): role is "ADMIN" {
  return role === "ADMIN";
}