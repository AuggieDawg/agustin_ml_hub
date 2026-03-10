import { BellRing, ShieldAlert, TriangleAlert } from "lucide-react"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import {
  EmptyPanelState,
  MetricCard,
  PageIntro,
  Panel,
  TonePill,
} from "@/components/client-security/ClientPortalPrimitives"
import { getClientPortalAlerts } from "@/lib/security/portal"

export default async function ClientAlertsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const data = await getClientPortalAlerts(session.user.id)

  if (!data.property) {
    return (
      <div className="space-y-6">
        <PageIntro
          eyebrow="Alerts"
          title="Prepare your incident timeline"
          description="This page now waits for real incident and event records instead of mock activity."
        />

        <Panel title="Alert onboarding">
          <EmptyPanelState
            title="No monitored property exists yet"
            description="Create a property and enroll devices first. Alerts and events only appear when something real has been recorded."
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
        eyebrow="Alerts"
        title={`${data.property.name} alert timeline`}
        description="The alert center now renders operational truth. No fake incidents, no decorative timelines."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label={data.metrics[0].label}
          value={data.metrics[0].value}
          helper={data.metrics[0].helper}
          tone={data.metrics[0].tone}
          icon={<BellRing className="h-5 w-5" />}
        />
        <MetricCard
          label={data.metrics[1].label}
          value={data.metrics[1].value}
          helper={data.metrics[1].helper}
          tone={data.metrics[1].tone}
          icon={<ShieldAlert className="h-5 w-5" />}
        />
        <MetricCard
          label={data.metrics[2].label}
          value={data.metrics[2].value}
          helper={data.metrics[2].helper}
          tone={data.metrics[2].tone}
          icon={<TriangleAlert className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <Panel title="Recent Alerts">
          {data.alerts.length === 0 ? (
            <EmptyPanelState
              title="No alerts recorded yet"
              description="When sensors, cameras, or system rules generate real incidents, they will appear here with severity, time, and zone context."
              actionHref="/client/devices"
              actionLabel="Open devices"
            />
          ) : (
            <div className="space-y-3">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{alert.title}</p>
                      {alert.detail ? (
                        <p className="mt-1 text-sm text-white/58">{alert.detail}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <TonePill tone={alert.tone} label={alert.zoneLabel} />
                      <TonePill tone="info" label={alert.statusLabel} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/40">
                    {alert.timeLabel}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Event Timeline">
          {data.events.length === 0 ? (
            <EmptyPanelState
              title="Waiting for activity"
              description="Events appear when the portal records arm/disarm actions, telemetry changes, device events, or incident transitions."
              actionHref="/client/overview"
              actionLabel="Open overview"
            />
          ) : (
            <div className="space-y-4">
              {data.events.map((event) => (
                <div key={event.id} className="flex gap-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-sky-300 shadow-[0_0_0_6px_rgba(125,211,252,0.12)]" />
                  <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{event.title}</p>
                      <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                        {event.timeLabel}
                      </span>
                    </div>
                    {event.detail ? (
                      <p className="mt-2 text-sm text-white/58">{event.detail}</p>
                    ) : null}
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">
                      Actor: {event.actorLabel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}