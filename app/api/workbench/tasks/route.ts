import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http/json";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const tasks = await prisma.workbenchTask.findMany({
    where: { ownerId: auth.userId },
    orderBy: { updatedAt: "desc" },
  });

  return jsonOk({ tasks });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const title = String(body.title ?? "").trim();
  const client = String(body.client ?? "").trim();
  const assignee = String(body.assignee ?? "").trim();

  if (!title || !client || !assignee) {
    return jsonError(400, "title, client, and assignee are required");
  }

  const created = await prisma.workbenchTask.create({
    data: {
      title,
      client,
      assignee,
      status: body.status ?? "Open",
      priority: body.priority ?? "Medium",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      ownerId: auth.userId,
    },
  });

  return jsonCreated({ task: created });
}