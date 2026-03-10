import Link from "next/link"
import type { ReactNode } from "react"

type Tone = "healthy" | "warning" | "critical" | "info"

export function Panel({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        {action ?? null}
      </div>
      {children}
    </section>
  )
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200/70">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">{description}</p>
    </div>
  )
}

export function MetricCard({
  label,
  value,
  helper,
  tone,
  icon,
}: {
  label: string
  value: string
  helper: string
  tone: Tone
  icon: ReactNode
}) {
  const toneClasses =
    tone === "healthy"
      ? "border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.14)_0%,rgba(255,255,255,0.03)_100%)]"
      : tone === "warning"
        ? "border-orange-400/20 bg-[linear-gradient(180deg,rgba(249,115,22,0.16)_0%,rgba(255,255,255,0.03)_100%)]"
        : tone === "critical"
          ? "border-red-400/20 bg-[linear-gradient(180deg,rgba(239,68,68,0.16)_0%,rgba(255,255,255,0.03)_100%)]"
          : "border-sky-400/20 bg-[linear-gradient(180deg,rgba(56,189,248,0.16)_0%,rgba(255,255,255,0.03)_100%)]"

  return (
    <div className={`rounded-[26px] border p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)] ${toneClasses}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
            {label}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-2 text-sm text-white/58">{helper}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/85">
          {icon}
        </div>
      </div>
    </div>
  )
}

export function TonePill({
  tone,
  label,
}: {
  tone: Tone
  label: string
}) {
  const className =
    tone === "healthy"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
      : tone === "warning"
        ? "border-amber-400/20 bg-amber-500/10 text-amber-200"
        : tone === "critical"
          ? "border-red-400/20 bg-red-500/10 text-red-200"
          : "border-sky-400/20 bg-sky-500/10 text-sky-200"

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${className}`}
    >
      {label}
    </span>
  )
}

export function EmptyPanelState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref: string
  actionLabel: string
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/15 bg-white/[0.02] p-6">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">{description}</p>

      <div className="mt-5">
        <Link
          href={actionHref}
          className="inline-flex items-center rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-2.5 text-sm font-medium text-sky-100 transition hover:bg-sky-500/15"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  )
}

export function CameraFeedCard({
  title,
  locationLabel,
  summary,
  tone,
  stateLabel,
  transportLabel,
  resolutionLabel,
  variant = "front",
}: {
  title: string
  locationLabel: string
  summary: string
  tone: Tone
  stateLabel: string
  transportLabel: string | null
  resolutionLabel: string | null
  variant?: "front" | "interior"
}) {
  const backgroundClass =
    variant === "front"
      ? "bg-[linear-gradient(180deg,rgba(16,24,40,0.05)_0%,rgba(4,7,12,0.2)_100%),radial-gradient(circle_at_18%_18%,rgba(255,223,128,0.38),transparent_18%),linear-gradient(145deg,#0f172a_0%,#1f2937_48%,#0b1220_100%)]"
      : "bg-[linear-gradient(180deg,rgba(16,24,40,0.05)_0%,rgba(4,7,12,0.2)_100%),radial-gradient(circle_at_68%_24%,rgba(255,230,180,0.32),transparent_18%),linear-gradient(145deg,#111827_0%,#1f2937_52%,#0b1220_100%)]"

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
      <div className={`relative aspect-[16/10] ${backgroundClass}`}>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent" />

        <div className="absolute left-4 top-4">
          <TonePill tone={tone} label={stateLabel} />
        </div>

        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
          {transportLabel ? <TonePill tone="info" label={transportLabel} /> : null}
          {resolutionLabel ? <TonePill tone="info" label={resolutionLabel} /> : null}
        </div>
      </div>

      <div className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-sm text-white/55">{locationLabel}</p>
        </div>

        <p className="mt-3 text-sm leading-6 text-white/58">{summary}</p>
      </div>
    </div>
  )
}

export function ActionLinkCard({
  href,
  label,
  description,
}: {
  href: string
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:bg-white/[0.08]"
    >
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-sm text-white/58">{description}</p>
      </div>

      <span className="text-xs uppercase tracking-[0.18em] text-white/35">Open</span>
    </Link>
  )
}