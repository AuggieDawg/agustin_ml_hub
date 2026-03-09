import type { ReactNode } from "react";
import { redirect } from "next/navigation";

export default function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  redirect("/client");
}