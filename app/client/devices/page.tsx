import { Camera, Cpu, ShieldCheck, TriangleAlert } from "lucide-react"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import {
  EmptyPanelState,
  MetricCard,
  PageIntro,
  Panel,
  TonePill,
} from "@/components/client-security/ClientPortalPrimitives"
import { getClientPortalDevices } from "@/lib/security/portal"

export default async function ClientDevicesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const data = await getClientPortalDevices(session.user.id)

  if (!data.property) {
    return (
      <div className="space-y-6">
        <PageIntro
          eyebrow="Devices"
          title="Prepare your hardware inventory"
          description="This page now waits for real device records. It will not fake inventory, health, or telemetry."
        />

        <Panel title="Device onboarding">
          <EmptyPanelState
            title="No monitored property exists yet"
            description="Create a property, add zones, and then enroll devices. This page will populate from real hardware records and telemetry instead of static demo rows."
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
        eyebrow="Devices"
        title={`${data.property.name} device inventory`}
        description="This inventory is database-backed. Empty states now invite enrollment instead of pretending hardware already exists."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label={data.metrics[0].label}
          value={data.metrics[0].value}
          helper={data.metrics[0].helper}
          tone={data.metrics[0].tone}
          icon={<Cpu className="h-5 w-5" />}
        />
        <MetricCard
          label={data.metrics[1].label}
          value={data.metrics[1].value}
          helper={data.metrics[1].helper}
          tone={data.metrics[1].tone}
          icon={<Camera className="h-5 w-5" />}
        />
        <MetricCard
          label={data.metrics[2].label}
          value={data.metrics[2].value}
          helper={data.metrics[2].helper}
          tone={data.metrics[2].tone}
          icon={<TriangleAlert className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
        <Panel title="Device Inventory">
          {data.devices.length === 0 ? (
            <EmptyPanelState
              title="No devices enrolled yet"
              description="Add your first camera, sensor, or panel to begin collecting operational state. Each device should belong to a property and, ideally, a mapped zone."
              actionHref="/client/cameras"
              actionLabel="Open camera center"
            />
          ) : (
            <div className="overflow-hidden rounded-[22px] border border-white/10">
              <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_auto] gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                <div>Name</div>
                <div>Type</div>
                <div>Zone</div>
                <div>Last Seen</div>
                <div>Status</div>
              </div>

              <div className="divide-y divide-white/10">
                {data.devices.map((device) => (
                  <div
                    key={device.id}
                    className="grid grid-cols-[1.3fr_1fr_1fr_1fr_auto] gap-3 px-4 py-4 text-sm text-white/72"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{device.name}</p>
                      <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-white/35">
                        {device.firmwareLabel}
                        {device.resolutionLabel ? ` • ${device.resolutionLabel}` : ""}
                      </p>
                    </div>
                    <div>{device.typeLabel}</div>
                    <div>{device.zoneLabel}</div>
                    <div>{device.lastSeenLabel}</div>
                    <div>
                      <TonePill tone={device.tone} label={device.statusLabel} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <div className="grid gap-6">
          <Panel title="Design Standard">
            <div className="space-y-3">
              <DeviceNote
                title="Enroll before you embellish"
                description="Do not fabricate health badges or pretend firmware history. Wait for real records."
              />
              <DeviceNote
                title="Zone assignment matters"
                description="A professional security portal should explain where a device lives, not just that it exists."
              />
              <DeviceNote
                title="Telemetry stays server-side"
                description="Last seen, health, and feed state should come from backend truth, not browser inference."
              />
            </div>
          </Panel>

          <Panel title="Data-inviting language">
            <div className="space-y-3">
              <PhraseCard
                label="No devices enrolled yet"
                note="Use when the property exists but has zero hardware records."
              />
              <PhraseCard
                label="No telemetry yet"
                note="Use when the device exists but has not reported in."
              />
              <PhraseCard
                label="Unassigned zone"
                note="Use when a device record exists before zone mapping is complete."
              />
            </div>
          </Panel>

          <Panel title="Operational Aim">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Build toward device truth
                  </p>
                  <p className="mt-1 text-sm text-white/58">
                    Every alert, stream, and service workflow should trace back to a real device record.
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function DeviceNote({
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

function PhraseCard({
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