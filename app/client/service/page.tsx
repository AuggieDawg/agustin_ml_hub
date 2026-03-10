import { CalendarClock, LifeBuoy, Wrench } from "lucide-react"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import {
  EmptyPanelState,
  MetricCard,
  PageIntro,
  Panel,
  TonePill,
} from "@/components/client-security/ClientPortalPrimitives"
import { getClientPortalService } from "@/lib/security/portal"

export default async function ClientServicePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const data = await getClientPortalService(session.user.id)

  if (!data.property) {
    return (
      <div className="space-y-6">
        <PageIntro
          eyebrow="Service"
          title="Prepare your service workflow"
          description="This page becomes valuable once a real monitored property exists and service records can be tied to it."
        />

        <Panel title="Service onboarding">
          <EmptyPanelState
            title="No monitored property exists yet"
            description="Create a property first. Once it exists, service tickets can become property-scoped operational records instead of generic notes."
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
        eyebrow="Service"
        title={`${data.property.name} service center`}
        description="Service is now grounded in real ticket records. Empty states invite action instead of faking support history."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label={data.metrics[0].label}
          value={data.metrics[0].value}
          helper={data.metrics[0].helper}
          tone={data.metrics[0].tone}
          icon={<LifeBuoy className="h-5 w-5" />}
        />
        <MetricCard
          label={data.metrics[1].label}
          value={data.metrics[1].value}
          helper={data.metrics[1].helper}
          tone={data.metrics[1].tone}
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <MetricCard
          label={data.metrics[2].label}
          value={data.metrics[2].value}
          helper={data.metrics[2].helper}
          tone={data.metrics[2].tone}
          icon={<Wrench className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <Panel title="Service Tickets">
          {data.tickets.length === 0 ? (
            <EmptyPanelState
              title="No service tickets yet"
              description="When clients request troubleshooting, installation changes, or maintenance, those tickets will appear here with property context and workflow state."
              actionHref="/client/overview"
              actionLabel="Open overview"
            />
          ) : (
            <div className="space-y-3">
              {data.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{ticket.title}</p>
                      {ticket.detail ? (
                        <p className="mt-1 text-sm text-white/58">{ticket.detail}</p>
                      ) : null}
                    </div>
                    <TonePill tone={ticket.tone} label={ticket.statusLabel} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/40">
                    <span>Priority: {ticket.priorityLabel}</span>
                    <span>•</span>
                    <span>Opened by: {ticket.openedByLabel}</span>
                    <span>•</span>
                    <span>{ticket.createdAtLabel}</span>
                  </div>

                  {ticket.scheduledForLabel ? (
                    <p className="mt-3 text-sm text-sky-200/80">
                      Scheduled for {ticket.scheduledForLabel}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div className="grid gap-6">
          <Panel title="Professional standard">
            <div className="space-y-3">
              <ServiceNote
                title="Property-scoped tickets"
                description="Every service record should tie back to the property, not float as a generic support item."
              />
              <ServiceNote
                title="Structured intake"
                description="Use ticket fields for priority, status, scheduling, and ownership instead of free-form text."
              />
              <ServiceNote
                title="Operational history"
                description="Resolved service work becomes a trust asset when clients can review it clearly."
              />
            </div>
          </Panel>

          <Panel title="Data-inviting language">
            <div className="space-y-3">
              <ServicePhrase
                label="No service tickets yet"
                note="Use when support has not been requested for this property."
              />
              <ServicePhrase
                label="No visit scheduled"
                note="Use when a ticket exists but no field window has been assigned."
              />
              <ServicePhrase
                label="Waiting for service intake"
                note="Use when the portal is ready but no property-scoped support records exist."
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function ServiceNote({
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

function ServicePhrase({
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