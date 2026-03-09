import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/require";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http/json";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const tasks = await prisma.task.findMany({
    where: {
      userId: auth.userId,
      scope: "PORTAL",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return jsonOk({ tasks });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  if (!title) {
    return jsonError(400, "Title is required");
  }

  const task = await prisma.task.create({
    data: {
      userId: auth.userId,
      title,
      scope: "PORTAL",
      completed: false,
    },
  });

  return jsonCreated({ task });
}