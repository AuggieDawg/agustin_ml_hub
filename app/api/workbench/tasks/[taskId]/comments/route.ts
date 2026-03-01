import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { taskId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comments = await prisma.workbenchTaskComment.findMany({
    where: { taskId: params.taskId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: Request, { params }: { params: { taskId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const text = String(body.body ?? "").trim();
  if (!text) return NextResponse.json({ error: "Empty comment" }, { status: 400 });

  const created = await prisma.workbenchTaskComment.create({
    data: {
      taskId: params.taskId,
      body: text,
      authorId: (session.user as any).id ?? null,
    },
  });

  return NextResponse.json({ comment: created }, { status: 201 });
}