import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { ClientPortalOverview } from "@/components/client-security/ClientPortalOverview"
import { getClientPortalOverview } from "@/lib/security/portal"

export default async function ClientOverviewPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const data = await getClientPortalOverview(session.user.id)

  return <ClientPortalOverview data={data} />
}