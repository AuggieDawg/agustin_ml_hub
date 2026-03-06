import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

type Params = { boxId: string };
type Ctx = { params: Promise<Params> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boxId } = await ctx.params;

  const data = await req.json().catch(() => null);

  const title =
    data?.title !== undefined ? String(data.title).trim() : undefined;
  const body =
    data?.body !== undefined ? String(data.body).trim() : undefined;

  const existing = await prisma.mapBox.findFirst({
    where: { id: boxId, userId: session.user.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.mapBox.update({
    where: { id: boxId },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(body !== undefined ? { body } : {}),
    },
  });

  return NextResponse.json({ box: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boxId } = await ctx.params;

  const existing = await prisma.mapBox.findFirst({
    where: { id: boxId, userId: session.user.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.mapBox.delete({ where: { id: boxId } });
  return NextResponse.json({ ok: true });
}