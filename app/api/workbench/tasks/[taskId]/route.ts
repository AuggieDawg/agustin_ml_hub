import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { jsonError, jsonOk } from "@/lib/http/json";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { taskId } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const existing = await prisma.workbenchTask.findFirst({
    where: {
      id: taskId,
      ownerId: auth.userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return jsonError(404, "Task not found");
  }

  const data: any = {};

  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.client !== undefined) data.client = String(body.client).trim();
  if (body.assignee !== undefined) data.assignee = String(body.assignee).trim();
  if (body.status !== undefined) data.status = body.status;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.dueDate !== undefined) {
    data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  }

  const updated = await prisma.workbenchTask.update({
    where: { id: taskId },
    data,
  });

  return jsonOk({ task: updated });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { taskId } = await params;

  const existing = await prisma.workbenchTask.findFirst({
    where: {
      id: taskId,
      ownerId: auth.userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return jsonError(404, "Task not found");
  }

  await prisma.workbenchTask.delete({
    where: { id: taskId },
  });

  return jsonOk({ ok: true });
}