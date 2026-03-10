import {
  Camera,
  MapPinned,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from "lucide-react"

import type { ClientPortalOverviewData } from "@/lib/security/portal"
import {
  ActionLinkCard,
  CameraFeedCard,
  EmptyPanelState,
  MetricCard,
  PageIntro,
  Panel,
  TonePill,
} from "@/components/client-security/ClientPortalPrimitives"

const metricIcons = [
  <Shield key="system-status" className="h-5 w-5" />,
  <ShieldCheck key="system-health" className="h-5 w-5" />,
  <ShieldAlert key="active-alerts" className="h-5 w-5" />,
  <Camera key="devices-online" className="h-5 w-5" />,
]

export function ClientPortalOverview({
  data,
}: {
  data: ClientPortalOverviewData
}) {
  if (!data.property) {
    return (
      <div className="space-y-6">
        <PageIntro
          eyebrow="Overview"
          title="Start your first monitored property"
          description="The portal is now database-driven. Instead of pretending there are feeds and alerts, it waits for real property, device, and stream records."
        />

        <Panel title="Portal onboarding">
          <EmptyPanelState
            title="No monitored property connected yet"
            description="Create a property, map at least one zone, and enroll your first camera or sensor. Once that data exists, the overview will fill itself with real status, feed readiness, events, and alerts."
            actionHref="/client/property-map"
            actionLabel="Open property map"
          />
        </Panel>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title="What appears here later">
            <div className="space-y-3">
              <ActionLinkCard
                href="/client/cameras"
                label="Camera feed readiness"
                description="Live-feed states, transport labels, and preview readiness will appear once cameras are configured."
              />
              <ActionLinkCard
                href="/client/alerts"
                label="Alert timeline"
                description="Active incidents will populate automatically when devices start reporting events."
              />
              <ActionLinkCard
                href="/client/service"
                label="Support workflow"
                description="Service requests become meaningful once a real monitored location exists."
              />
            </div>
          </Panel>

          <Panel title="Design rule">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">Truthful empty states</p>
              <p className="mt-2 text-sm leading-6 text-white/58">
                This is the right standard. The UI should invite data and configuration,
                not fake maturity with invented incidents and pretend feeds.
              </p>
            </div>
          </Panel>

          <Panel title="Build order">
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">1. Property</p>
                <p className="mt-1 text-sm text-white/58">Create the monitored location.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">2. Zones</p>
                <p className="mt-1 text-sm text-white/58">Map entrances, rooms, and perimeter coverage.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">3. Devices and streams</p>
                <p className="mt-1 text-sm text-white/58">Attach cameras, stream profiles, and health telemetry.</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Overview"
        title={data.property.name}
        description="This overview only renders real portal state. Empty sections now use data-inviting labels instead of decorative mock content."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            helper={metric.helper}
            tone={metric.tone}
            icon={metricIcons[index] ?? <Shield className="h-5 w-5" />}
          />
        ))}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.85fr]">
        <div className="grid gap-6">
          <Panel title="Recent Alerts">
            {data.alerts.length === 0 ? (
              <EmptyPanelState
                title="No active alerts right now"
                description="When sensors, cameras, and automation rules generate real incidents, they will appear here with timestamps and zone context."
                actionHref="/client/alerts"
                actionLabel="Open alerts"
              />
            ) : (
              <div className="divide-y divide-white/10">
                {data.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{alert.title}</p>
                      {alert.detail ? (
                        <p className="mt-1 text-sm text-white/55">{alert.detail}</p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3">
                      <TonePill tone={alert.tone} label={alert.zoneLabel} />
                      <span className="text-sm text-white/45">{alert.timeLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Camera Feeds">
            {data.cameraFeeds.length === 0 ? (
              <EmptyPanelState
                title="No camera feeds connected yet"
                description="Add your first 4K camera record and create a primary stream profile. Feed readiness, delivery transport, and preview state will appear here once that data exists."
                actionHref="/client/cameras"
                actionLabel="Open camera center"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {data.cameraFeeds.map((feed, index) => (
                  <CameraFeedCard
                    key={feed.id}
                    title={feed.title}
                    locationLabel={feed.locationLabel}
                    summary={feed.summary}
                    tone={feed.tone}
                    stateLabel={feed.stateLabel}
                    transportLabel={feed.transportLabel}
                    resolutionLabel={feed.resolutionLabel}
                    variant={index % 2 === 0 ? "front" : "interior"}
                  />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Event History">
            {data.events.length === 0 ? (
              <EmptyPanelState
                title="Waiting for device activity"
                description="Events appear when the system records real device telemetry, alerts, arm/disarm actions, or service-side incident changes."
                actionHref="/client/devices"
                actionLabel="Open devices"
              />
            ) : (
              <div className="divide-y divide-white/10">
                {data.events.map((event) => (
                  <div
                    key={event.id}
                    className="grid gap-2 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_auto]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{event.title}</p>
                      {event.detail ? (
                        <p className="mt-1 text-sm text-white/55">{event.detail}</p>
                      ) : null}
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">
                        Actor: {event.actorLabel}
                      </p>
                    </div>
                    <div className="text-sm text-white/45">{event.timeLabel}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="grid gap-6">
          <Panel title="Property Overview">
            {data.zones.length === 0 ? (
              <EmptyPanelState
                title="No zones mapped yet"
                description="Zones let the portal explain where devices live and where alerts happened. Add entrances, rooms, and perimeter areas first."
                actionHref="/client/property-map"
                actionLabel="Map zones"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {data.zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-200">
                        <MapPinned className="h-4 w-4" />
                      </div>
                      <TonePill tone="info" label={zone.statusLabel} />
                    </div>

                    <p className="text-sm font-medium text-white">{zone.name}</p>
                    <p className="mt-1 text-sm text-white/55">
                      {zone.deviceCount} device{zone.deviceCount === 1 ? "" : "s"}
                    </p>
                    {zone.note ? (
                      <p className="mt-2 text-sm text-white/45">{zone.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Service & Support">
            <div className="space-y-3">
              <ActionLinkCard
                href="/client/service"
                label="Request service"
                description="Open a service ticket for installation, troubleshooting, or maintenance."
              />
              <ActionLinkCard
                href="/client/documents"
                label="View documents"
                description="Store install documents, warranties, and operational handoff records."
              />
              <ActionLinkCard
                href="/client/billing"
                label="Review billing"
                description="Track monitored-plan status, invoices, and commercial records."
              />
            </div>
          </Panel>

          <Panel title="Build Standard">
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-200">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">No fake live feeds</p>
                    <p className="mt-1 text-sm text-white/58">
                      Feed cards stay empty until a real camera and stream profile exist.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-200">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Status from database truth</p>
                    <p className="mt-1 text-sm text-white/58">
                      Metrics now derive from actual device, alert, and stream records.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-200">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Operationally honest UX</p>
                    <p className="mt-1 text-sm text-white/58">
                      Empty states invite the next action instead of pretending the system is already deployed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}