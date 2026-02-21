/**
 * app/api/tasks/route.ts
 *
 * Collection endpoint for Tasks:
 * - GET  /api/tasks     -> list tasks for current user
 * - POST /api/tasks     -> create a task for current user
 *
 * IMPORTANT:
 * - This file MUST exist for /api/tasks to resolve.
 * - Without it, the app will return 404 for /api/tasks (exactly what you're seeing).
 *
 * Security model:
 * - Requires authentication (NextAuth session)
 * - Scopes all reads/writes to session.user.id
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// Ensure this route runs in a Node.js runtime (Prisma does not work in Edge runtime).
export const runtime = "nodejs";

/**
 * GET /api/tasks
 * Return all tasks belonging to the signed-in user.
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const tasks = await prisma.task.findMany({
    where: { userId, scope: "PORTAL" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tasks }, { status: 200 });
}

/**
 * POST /api/tasks
 * Create a new task for the signed-in user.
 *
 * Body: { title: string }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      userId,
      scope: "PORTAL",
      // completed defaults to false in schema (if you added it)
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
