import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { jsonError } from "@/lib/http/json";

export type RequireAuthResult = {
  userId: string;
  role: string;
};

export async function requireAuth(): Promise<RequireAuthResult | Response> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return jsonError(401, "Unauthorized");
  }

  if (!session.user.id) {
    return jsonError(500, "Session missing user.id");
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

  if (result.role !== "ADMIN") {
    return jsonError(403, "Forbidden");
  }

  return result;
}