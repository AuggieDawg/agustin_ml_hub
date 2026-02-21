import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

function requireAdmin(session: any) {
  const role = (session?.user as any)?.role;
  return role === "ADMIN";
}

export async function PATCH(req: Request, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!requireAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session.user as any).id as string;
  const { id } = await context.params;

  if (!id) return NextResponse.json({ error: "Invalid task id" }, { status: 400 });

  const body = await req.json().catch(() => null);

  const data: { title?: string; completed?: boolean } = {};
  if (typeof body?.title === "string") {
    const trimmed = body.title.trim();
    if (!trimmed) return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    data.title = trimmed;
  }
  if (typeof body?.completed === "boolean") data.completed = body.completed;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.task.updateMany({
    where: { id, userId, scope: "OWNER" },
    data,
  });

  if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const task = await prisma.task.findFirst({ where: { id, userId, scope: "OWNER" } });
  return NextResponse.json({ task }, { status: 200 });
}

export async function DELETE(_req: Request, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!requireAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session.user as any).id as string;
  const { id } = await context.params;

  if (!id) return NextResponse.json({ error: "Invalid task id" }, { status: 400 });

  const deleted = await prisma.task.deleteMany({
    where: { id, userId, scope: "OWNER" },
  });

  if (deleted.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true }, { status: 200 });
}
