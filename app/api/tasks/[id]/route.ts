/**
 * app/api/tasks/[id]/route.ts
 *
 * Single-task endpoints:
 * - PATCH  /api/tasks/:id   -> update title/completed for ONE task
 * - DELETE /api/tasks/:id   -> delete ONE task
 *
 * IMPORTANT (your bug):
 * In your Next.js version, `context.params` is a Promise.
 * If you read `params.id` without awaiting, `id` becomes undefined.
 * Prisma then interprets { id: undefined, userId } as { userId } and
 * will update/delete *ALL* tasks for that user.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

type Context = {
  // Next.js 16+ can provide params as a Promise in route handlers
  params: Promise<{ id: string }>;
};

/**
 * PATCH /api/tasks/:id
 * Body can include:
 * - { title: string }
 * - { completed: boolean }
 * - or both
 */
export async function PATCH(req: Request, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  // ✅ FIX: params must be awaited
  const { id } = await context.params;

  // Hard guard so we never accidentally update many rows
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);

  const data: { title?: string; completed?: boolean } = {};

  if (typeof body?.title === "string") {
    const trimmed = body.title.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }
    data.title = trimmed;
  }

  if (typeof body?.completed === "boolean") {
    data.completed = body.completed;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Ownership enforcement in the query
  const updated = await prisma.task.updateMany({
    where: { id, userId, scope: "PORTAL" },
    data,
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const task = await prisma.task.findFirst({ where: { id, userId } });
  return NextResponse.json({ task }, { status: 200 });
}

/**
 * DELETE /api/tasks/:id
 */
export async function DELETE(_req: Request, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  // ✅ FIX: params must be awaited
  const { id } = await context.params;

  // Hard guard so we never accidentally delete many rows
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const deleted = await prisma.task.deleteMany({
    where: { id, userId, scope: "PORTAL" },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deleted: deleted.count }, { status: 200 });
}
