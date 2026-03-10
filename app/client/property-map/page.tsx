import { Camera, DoorOpen, House, Lock, MapPinned, ShieldCheck } from "lucide-react"

import {
  PageIntro,
  Panel,
  TonePill,
} from "@/components/client-security/ClientPortalPrimitives"
import { propertyZones } from "@/components/client-security/data"

export default function ClientPropertyMapPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Property Map"
        title="Zone coverage and device placement"
        description="This page becomes the visual command layer for the property. For now it is structured around zones so we can wire in real hardware later without rebuilding the UI."
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
        <Panel title="Mapped Zones">
          <div className="grid gap-4 md:grid-cols-2">
            {propertyZones.map((zone) => (
              <div
                key={zone.name}
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sky-200">
                    <MapPinned className="h-5 w-5" />
                  </div>
                  <TonePill tone={zone.tone} label={zone.status} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-white">{zone.name}</h3>
                <p className="mt-1 text-sm text-white/58">{zone.note}</p>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <ZoneStat
                    icon={<Camera className="h-4 w-4" />}
                    label="Cameras"
                    value={String(zone.cameras)}
                  />
                  <ZoneStat
                    icon={<DoorOpen className="h-4 w-4" />}
                    label="Sensors"
                    value={String(zone.sensors)}
                  />
                  <ZoneStat
                    icon={<Lock className="h-4 w-4" />}
                    label="Locks"
                    value={String(zone.locks)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-6">
          <Panel title="Deployment Notes">
            <div className="space-y-4 text-sm leading-6 text-white/70">
              <p>
                The goal is to keep the map page independent from any one camera vendor.
                Devices should eventually sync into zones through a normalized server-side
                ingest layer, not directly from the browser.
              </p>
              <p>
                When you start buying cameras, think in terms of zone ownership, power,
                retention, and event routing. That discipline matters more than buying
                flashy hardware.
              </p>
            </div>
          </Panel>

          <Panel title="Professional Build Targets">
            <div className="space-y-3">
              <RoadmapItem
                icon={<House className="h-4 w-4" />}
                title="Property-first modeling"
                description="Every device belongs to a property and a zone."
              />
              <RoadmapItem
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Server-side event logging"
                description="Trigger events, alerts, and audit records on the backend."
              />
              <RoadmapItem
                icon={<Camera className="h-4 w-4" />}
                title="Camera feed abstraction"
                description="Keep feed metadata separate from rendering strategy."
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function ZoneStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/75">
        {icon}
      </div>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
    </div>
  )
}

function RoadmapItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-200">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-white/58">{description}</p>
        </div>
      </div>
    </div>
  )
}