import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { jsonError, jsonOk } from "@/lib/http/json";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ taskId: string; commentId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { taskId, commentId } = await params;

  const task = await prisma.workbenchTask.findFirst({
    where: {
      id: taskId,
      ownerId: auth.userId,
    },
    select: { id: true },
  });

  if (!task) {
    return jsonError(404, "Task not found");
  }

  const comment = await prisma.workbenchTaskComment.findUnique({
    where: { id: commentId },
    select: { id: true, taskId: true },
  });

  if (!comment) {
    return jsonError(404, "Comment not found");
  }

  if (comment.taskId !== taskId) {
    return jsonError(400, "Comment does not belong to this task");
  }

  await prisma.workbenchTaskComment.delete({
    where: { id: commentId },
  });

  return jsonOk({ ok: true });
}