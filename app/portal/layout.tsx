/**
 * app/portal/layout.tsx
 *
 * Purpose:
 * - Guard ALL routes under /portal/* for authenticated users.
 * - Ensures user portal is always protected.
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/api/auth/signin");

  return <>{children}</>;
}
