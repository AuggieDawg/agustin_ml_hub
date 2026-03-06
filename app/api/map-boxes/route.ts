import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth"; // if your auth export lives elsewhere, change this import

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boxes = await prisma.mapBox.findMany({
    where: { userId: session.user.id },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ boxes });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json().catch(() => null);
  const title = String(data?.title ?? "").trim();
  const body = String(data?.body ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const maxOrder = await prisma.mapBox.aggregate({
    where: { userId: session.user.id },
    _max: { order: true },
  });

  const created = await prisma.mapBox.create({
    data: {
      userId: session.user.id,
      title,
      body,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json({ box: created }, { status: 201 });
}