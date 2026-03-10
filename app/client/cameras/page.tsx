import { Camera, ShieldCheck, TriangleAlert } from "lucide-react"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import {
  CameraFeedCard,
  EmptyPanelState,
  MetricCard,
  PageIntro,
  Panel,
} from "@/components/client-security/ClientPortalPrimitives"
import { getClientPortalCameras } from "@/lib/security/portal"

export default async function ClientCamerasPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const data = await getClientPortalCameras(session.user.id)

  if (!data.property) {
    return (
      <div className="space-y-6">
        <PageIntro
          eyebrow="Cameras"
          title="Prepare your first camera deployment"
          description="This page is now wired for real camera records. No pretend feeds will render until a property and camera devices exist in the database."
        />

        <Panel title="Camera onboarding">
          <EmptyPanelState
            title="No monitored property exists yet"
            description="Create a property first. Then add camera devices and a primary stream profile for each one you want visible in the client portal."
            actionHref="/client/property-map"
            actionLabel="Open property map"
          />
        </Panel>
      </div>
    )
  }

  const configuredCount = data.cameras.length
  const liveReadyCount = data.cameras.filter((camera) => camera.stateKey === "LIVE").length
  const attentionCount = data.cameras.filter(
    (camera) =>
      camera.stateKey === "DEGRADED" ||
      camera.stateKey === "OFFLINE" ||
      camera.stateKey === "UNCONFIGURED" ||
      camera.stateKey === "NO_PROFILE",
  ).length

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Cameras"
        title={`${data.property.name} camera center`}
        description="Camera cards now reflect actual camera and stream records. Unconfigured entries invite setup; live-ready entries show delivery state and transport labels."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Configured Cameras"
          value={String(configuredCount)}
          helper="Camera device records in database"
          tone={configuredCount > 0 ? "healthy" : "info"}
          icon={<Camera className="h-5 w-5" />}
        />
        <MetricCard
          label="Live Ready"
          value={String(liveReadyCount)}
          helper="Primary stream ready for browser delivery"
          tone={liveReadyCount > 0 ? "healthy" : "info"}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <MetricCard
          label="Needs Attention"
          value={String(attentionCount)}
          helper="Missing or degraded stream setup"
          tone={attentionCount > 0 ? "warning" : "healthy"}
          icon={<TriangleAlert className="h-5 w-5" />}
        />
      </div>

      <Panel title="Camera Feeds">
        {data.cameras.length === 0 ? (
          <EmptyPanelState
            title="No camera devices enrolled yet"
            description="Add your first 4K camera record, assign it to a zone, and create a primary stream profile. Once that happens, this page will show feed readiness instead of placeholders."
            actionHref="/client/devices"
            actionLabel="Open devices"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.cameras.map((camera, index) => (
              <CameraFeedCard
                key={camera.id}
                title={camera.title}
                locationLabel={camera.locationLabel}
                summary={camera.summary}
                tone={camera.tone}
                stateLabel={camera.stateLabel}
                transportLabel={camera.transportLabel}
                resolutionLabel={camera.resolutionLabel}
                variant={index % 2 === 0 ? "front" : "interior"}
              />
            ))}
          </div>
        )}
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="What “done right” means">
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">Device record first</p>
              <p className="mt-1 text-sm text-white/58">
                Every camera should exist as a property-scoped device before any live-feed work starts.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">Primary stream profile second</p>
              <p className="mt-1 text-sm text-white/58">
                The client portal needs to know which transport and stream is intended for browser delivery.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">Health telemetry third</p>
              <p className="mt-1 text-sm text-white/58">
                Latency, bitrate, availability, and failure states should come from the backend, not browser guesses.
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Good empty-state language">
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">No camera devices enrolled yet</p>
              <p className="mt-1 text-sm text-white/58">
                Use this before any hardware record exists.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">Awaiting stream setup</p>
              <p className="mt-1 text-sm text-white/58">
                Use this when a camera exists but no primary stream profile has been configured.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">Live ready</p>
              <p className="mt-1 text-sm text-white/58">
                Use this only when the backend has confirmed a browser-deliverable stream path.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}