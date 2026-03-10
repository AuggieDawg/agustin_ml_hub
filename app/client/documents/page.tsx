import { FileCheck2, FolderKanban, ShieldCheck } from "lucide-react"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import {
  EmptyPanelState,
  MetricCard,
  PageIntro,
  Panel,
} from "@/components/client-security/ClientPortalPrimitives"
import { getClientPortalDocuments } from "@/lib/security/portal"

export default async function ClientDocumentsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const data = await getClientPortalDocuments(session.user.id)

  if (!data.property) {
    return (
      <div className="space-y-6">
        <PageIntro
          eyebrow="Documents"
          title="Prepare your property document library"
          description="This page now waits for real operational, warranty, and commercial file records."
        />

        <Panel title="Document onboarding">
          <EmptyPanelState
            title="No monitored property exists yet"
            description="Create a property first. Document records become useful when they belong to a real monitored location."
            actionHref="/client/property-map"
            actionLabel="Open property map"
          />
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Documents"
        title={`${data.property.name} documents`}
        description="Document records now come from real database entries. Empty states invite uploads and operational handoff instead of faking a library."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label={data.metrics[0].label}
          value={data.metrics[0].value}
          helper={data.metrics[0].helper}
          tone={data.metrics[0].tone}
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <MetricCard
          label={data.metrics[1].label}
          value={data.metrics[1].value}
          helper={data.metrics[1].helper}
          tone={data.metrics[1].tone}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <MetricCard
          label={data.metrics[2].label}
          value={data.metrics[2].value}
          helper={data.metrics[2].helper}
          tone={data.metrics[2].tone}
          icon={<FileCheck2 className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <Panel title="Document Library">
          {data.documents.length === 0 ? (
            <EmptyPanelState
              title="No document records yet"
              description="Upload or register installation summaries, warranties, agreements, and operational handoff documents for this property."
              actionHref="/client/service"
              actionLabel="Open service center"
            />
          ) : (
            <div className="space-y-3">
              {data.documents.map((document) => (
                <div
                  key={document.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {document.name}
                      </p>
                      {document.summary ? (
                        <p className="mt-1 text-sm text-white/58">
                          {document.summary}
                        </p>
                      ) : null}
                    </div>

                    <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                      {document.categoryLabel}
                    </div>
                  </div>

                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/40">
                    Uploaded {document.uploadedAtLabel}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div className="grid gap-6">
          <Panel title="Professional standard">
            <div className="space-y-3">
              <DocumentNote
                title="Operational records matter"
                description="Installation summaries, camera diagrams, and handoff documents are part of the product."
              />
              <DocumentNote
                title="Commercial records matter too"
                description="Agreements and warranties should be accessible without asking support to dig for them."
              />
              <DocumentNote
                title="Truth over decoration"
                description="If there are no documents yet, say so clearly and invite the next action."
              />
            </div>
          </Panel>

          <Panel title="Data-inviting language">
            <div className="space-y-3">
              <DocumentPhrase
                label="No document records yet"
                note="Use when no files or document rows exist for the property."
              />
              <DocumentPhrase
                label="Upload installation summary"
                note="Good call-to-action for the first operational record."
              />
              <DocumentPhrase
                label="Add warranty packet"
                note="Good call-to-action when hardware exists but support documents do not."
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function DocumentNote({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-white/58">{description}</p>
    </div>
  )
}

function DocumentPhrase({
  label,
  note,
}: {
  label: string
  note: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="mt-1 text-sm text-white/58">{note}</p>
    </div>
  )
}