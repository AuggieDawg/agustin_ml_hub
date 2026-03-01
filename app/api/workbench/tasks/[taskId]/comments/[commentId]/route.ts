import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: { commentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.workbenchTaskComment.delete({ where: { id: params.commentId } });
  return NextResponse.json({ ok: true });
}