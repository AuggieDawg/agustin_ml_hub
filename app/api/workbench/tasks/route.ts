import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
// ✅ Change this to your real authOptions export path:
import { authOptions } from "@/lib/auth/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await prisma.workbenchTask.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const title = String(body.title ?? "").trim();
  const client = String(body.client ?? "").trim();
  const assignee = String(body.assignee ?? "").trim();

  if (!title || !client || !assignee) {
    return NextResponse.json({ error: "title, client, and assignee are required" }, { status: 400 });
  }

  const created = await prisma.workbenchTask.create({
    data: {
      title,
      client,
      assignee,
      status: body.status ?? "Open",
      priority: body.priority ?? "Medium",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      ownerId: (session.user as any).id ?? null,
    },
  });

  return NextResponse.json({ task: created }, { status: 201 });
}