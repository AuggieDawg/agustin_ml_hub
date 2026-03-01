import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { taskId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const updated = await prisma.workbenchTask.update({
    where: { id: params.taskId },
    data: {
      title: body.title !== undefined ? String(body.title).trim() : undefined,
      client: body.client !== undefined ? String(body.client).trim() : undefined,
      assignee: body.assignee !== undefined ? String(body.assignee).trim() : undefined,
      status: body.status !== undefined ? body.status : undefined,
      priority: body.priority !== undefined ? body.priority : undefined,
      dueDate:
        body.dueDate !== undefined
          ? body.dueDate
            ? new Date(body.dueDate)
            : null
          : undefined,
    },
  });

  return NextResponse.json({ task: updated });
}

export async function DELETE(_: Request, { params }: { params: { taskId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.workbenchTask.delete({ where: { id: params.taskId } });
  return NextResponse.json({ ok: true });
}