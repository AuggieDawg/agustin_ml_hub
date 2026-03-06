import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http/json";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { taskId } = await params;

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

  const comments = await prisma.workbenchTaskComment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
  });

  return jsonOk({ comments });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { taskId } = await params;

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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const text = String(body.body ?? "").trim();
  if (!text) {
    return jsonError(400, "Comment body is required");
  }

  const created = await prisma.workbenchTaskComment.create({
    data: {
      taskId,
      body: text,
      authorId: auth.userId,
    },
  });

  return jsonCreated({ comment: created });
}