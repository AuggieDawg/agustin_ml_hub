import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http/json";

function toFiniteNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const [tasks, links] = await Promise.all([
    prisma.workbenchTask.findMany({
      where: { ownerId: auth.userId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.workbenchTaskLink.findMany({
      where: { ownerId: auth.userId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return jsonOk({ tasks, links });
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

  const existingCount = await prisma.workbenchTask.count({
    where: { ownerId: auth.userId },
  });

  const column = existingCount % 4;
  const row = Math.floor(existingCount / 4);

  const defaultX = 40 + column * 240;
  const defaultY = 40 + row * 160;

  const created = await prisma.workbenchTask.create({
    data: {
      title,
      client,
      assignee,
      status: body.status ?? "Open",
      priority: body.priority ?? "Medium",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      mapX: toFiniteNumber(body.mapX, defaultX),
      mapY: toFiniteNumber(body.mapY, defaultY),
      ownerId: auth.userId,
    },
  });

  return jsonCreated({ task: created });
}