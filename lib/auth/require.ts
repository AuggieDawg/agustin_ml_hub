import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/rbac";
import { jsonError } from "@/lib/http/json";

export type RequireAuthResult = {
  userId: string;
  role: string;
};

export async function requireAuth(): Promise<RequireAuthResult | Response> {
  const session = await auth();

  if (!session?.user?.id) {
    return jsonError(401, "Unauthorized");
  }

  return {
    userId: session.user.id,
    role: session.user.role ?? "USER",
  };
}

export async function requireAdmin(): Promise<RequireAuthResult | Response> {
  const result = await requireAuth();

  if (result instanceof Response) {
    return result;
  }

  if (!isAdmin(result.role)) {
    return jsonError(403, "Forbidden");
  }

  return result;
}