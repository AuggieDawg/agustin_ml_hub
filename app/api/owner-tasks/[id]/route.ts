import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { jsonError, jsonOk } from "@/lib/http/json";

export const runtime = "nodejs";

type TaskRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, ctx: TaskRouteContext) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;

  const existing = await prisma.task.findFirst({
    where: {
      id,
      userId: auth.userId,
      scope: "OWNER",
    },
  });

  if (!existing) {
    return jsonError(404, "Task not found");
  }

  const body = await req.json().catch(() => null);
  const data: { title?: string; completed?: boolean } = {};

  if (body?.title !== undefined) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return jsonError(400, "Title must be a non-empty string");
    }
    data.title = title;
  }

  if (body?.completed !== undefined) {
    if (typeof body.completed !== "boolean") {
      return jsonError(400, "completed must be a boolean");
    }
    data.completed = body.completed;
  }

  if (Object.keys(data).length === 0) {
    return jsonError(400, "Nothing to update");
  }

  const task = await prisma.task.update({
    where: { id: existing.id },
    data,
  });

  return jsonOk({ task });
}

export async function DELETE(_req: Request, ctx: TaskRouteContext) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;

  const result = await prisma.task.deleteMany({
    where: {
      id,
      userId: auth.userId,
      scope: "OWNER",
    },
  });

  if (result.count === 0) {
    return jsonError(404, "Task not found");
  }

  return jsonOk({ ok: true });
}