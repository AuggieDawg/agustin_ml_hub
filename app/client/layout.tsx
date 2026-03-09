import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  return <>{children}</>;
}