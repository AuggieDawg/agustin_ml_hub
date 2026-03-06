import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { jsonError, jsonOk } from "@/lib/http/json";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { linkId } = await params;

  const existing = await prisma.workbenchTaskLink.findFirst({
    where: {
      id: linkId,
      ownerId: auth.userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return jsonError(404, "Link not found");
  }

  await prisma.workbenchTaskLink.delete({
    where: { id: linkId },
  });

  return jsonOk({ ok: true });
}