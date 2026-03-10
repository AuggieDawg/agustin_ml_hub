import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  Camera,
  ChevronRight,
  Clock3,
  Cpu,
  DoorOpen,
  FileText,
  LayoutDashboard,
  MapPinned,
  MoreHorizontal,
  ReceiptText,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  TriangleAlert,
  Wrench,
} from "lucide-react";

type SidebarItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
  soon?: boolean;
};

type AlertItem = {
  label: string;
  time: string;
  severity: "critical" | "warning" | "info";
};

type EventItem = {
  time: string;
  title: string;
  detail: string;
};

const sidebarItems: SidebarItem[] = [
  { label: "Overview", icon: LayoutDashboard, href: "/client", active: true },
  { label: "Property Map", icon: MapPinned, soon: true },
  { label: "Devices", icon: Cpu, soon: true },
  { label: "Alerts", icon: BellRing, soon: true },
  { label: "Service", icon: Wrench, soon: true },
  { label: "Billing", icon: ReceiptText, soon: true },
  { label: "Documents", icon: FileText, soon: true },
];

const recentAlerts: AlertItem[] = [
  { label: "Front Door Opened", time: "8:14 PM", severity: "critical" },
  { label: "Motion Detected", time: "8:15 PM", severity: "warning" },
  { label: "Garage Camera Reconnected", time: "7:58 PM", severity: "info" },
];

const eventHistory: EventItem[] = [
  { time: "08:16 PM", title: "Motion Detected", detail: "Living Room sensor reported movement." },
  { time: "08:03 PM", title: "Back Door Opened", detail: "Door contact opened and closed normally." },
  { time: "07:45 PM", title: "Camera Offline", detail: "Garage camera dropped for 2 minutes." },
];

const zones = ["Front Entry", "Living Room", "Garage", "Backyard"];

export default function ClientDashboard() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_26%),linear-gradient(180deg,_#05070b_0%,_#070b12_45%,_#040507_100%)] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,24,0.96)_0%,rgba(6,10,18,0.96)_100%)] shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/10 text-sky-200 shadow-[0_0_30px_rgba(56,189,248,0.15)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                    Client Security
                  </p>
                  <p className="text-base font-semibold text-white">Home Security</p>
                </div>
              </div>
            </div>

            <nav className="px-3 py-4">
              <ul className="space-y-1.5">
                {sidebarItems.map((item) => (
                  <li key={item.label}>
                    <SidebarNavItem item={item} />
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-white/10 px-4 py-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  Monitoring
                </p>
                <p className="mt-3 text-sm font-medium text-white">All systems reporting normally.</p>
                <p className="mt-1 text-sm leading-6 text-white/60">
                  This first pass focuses on the overview experience before wiring the full route tree.
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,22,0.96)_0%,rgba(7,11,18,0.96)_100%)] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200/70">
                  Client Security Center
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  Home Security
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-11 min-w-[220px] items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/60">
                  <Search className="h-4 w-4 text-white/45" />
                  <span>Search devices, alerts, or notes</span>
                </div>

                <IconButton ariaLabel="Notifications">
                  <BellRing className="h-4 w-4" />
                </IconButton>

                <IconButton ariaLabel="Settings">
                  <Settings2 className="h-4 w-4" />
                </IconButton>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(244,114,182,0.18)_0%,rgba(59,130,246,0.14)_100%)] text-sm font-semibold text-white">
                  AR
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 2xl:grid-cols-[1.2fr_0.85fr]">
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <StatusCard
                    label="System Status"
                    value="Armed Away"
                    tone="warning"
                    icon={<Shield className="h-5 w-5" />}
                  />
                  <StatusCard
                    label="System Health"
                    value="All Systems Normal"
                    tone="healthy"
                    icon={<ShieldCheck className="h-5 w-5" />}
                  />
                </div>

                <Panel title="Recent Alerts">
                  <div className="divide-y divide-white/10">
                    {recentAlerts.map((alert) => (
                      <div
                        key={`${alert.label}-${alert.time}`}
                        className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <SeverityDot severity={alert.severity} />
                          <span className="truncate text-sm font-medium text-white">{alert.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/55">
                          <span>{alert.time}</span>
                          <ChevronRight className="h-4 w-4 text-white/35" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel
                  title="Camera Feeds"
                  action={
                    <button
                      type="button"
                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/65 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  }
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <CameraPreview
                      label="Front Door"
                      description="Entry camera • Motion-ready"
                      variant="front"
                    />
                    <CameraPreview
                      label="Living Room"
                      description="Interior camera • Privacy schedule"
                      variant="living"
                    />
                  </div>
                </Panel>

                <Panel
                  title="Event History"
                  action={
                    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/55">
                      <Clock3 className="h-4 w-4" />
                      Sep
                    </div>
                  }
                >
                  <div className="divide-y divide-white/10">
                    {eventHistory.map((event) => (
                      <div
                        key={`${event.time}-${event.title}`}
                        className="grid gap-2 py-4 first:pt-0 last:pb-0 md:grid-cols-[92px_minmax(0,1fr)_auto] md:items-center"
                      >
                        <div className="text-sm font-semibold text-white/72">{event.time}</div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{event.title}</p>
                          <p className="mt-1 text-sm text-white/55">{event.detail}</p>
                        </div>
                        <ChevronRight className="hidden h-4 w-4 text-white/35 md:block" />
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>

              <div className="grid gap-6">
                <Panel title="Property Overview">
                  <div className="grid grid-cols-2 gap-3">
                    {zones.map((zone) => (
                      <div
                        key={zone}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4"
                      >
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-200">
                          <MapPinned className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium text-white">{zone}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Service & Support">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-red-400/15 bg-red-500/[0.06] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-200/70">
                        Open Issue
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">Garage camera offline earlier today</p>
                      <p className="mt-1 text-sm text-white/55">
                        Technician follow-up recommended if recurrence continues.
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <InfoTile label="Next Service Window" value="Tue • 10:30 AM" />
                      <InfoTile label="Current Balance" value="$120.00" />
                    </div>

                    <div className="grid gap-3">
                      <ActionButton icon={<Wrench className="h-4 w-4" />} label="Request Service" />
                      <ActionButton icon={<FileText className="h-4 w-4" />} label="View Documents" />
                      <ActionButton icon={<ReceiptText className="h-4 w-4" />} label="Pay Invoice" />
                    </div>
                  </div>
                </Panel>

                <Panel title="System Snapshot">
                  <div className="space-y-3">
                    <DeviceRow
                      icon={<Camera className="h-4 w-4" />}
                      label="Front Door Camera"
                      status="Online"
                      statusTone="healthy"
                    />
                    <DeviceRow
                      icon={<DoorOpen className="h-4 w-4" />}
                      label="Hall Motion Sensor"
                      status="Active"
                      statusTone="healthy"
                    />
                    <DeviceRow
                      icon={<TriangleAlert className="h-4 w-4" />}
                      label="Smoke Detector"
                      status="Battery Low"
                      statusTone="warning"
                    />
                  </div>
                </Panel>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function SidebarNavItem({ item }: { item: SidebarItem }) {
  const Icon = item.icon;

  const content = (
    <>
      <span
        className={[
          "flex h-10 w-10 items-center justify-center rounded-2xl border transition",
          item.active
            ? "border-sky-400/25 bg-sky-500/10 text-sky-200"
            : "border-white/10 bg-white/[0.03] text-white/65",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="flex-1 text-sm font-medium">{item.label}</span>

      {item.soon ? (
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
          Soon
        </span>
      ) : null}
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={[
          "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition",
          item.active
            ? "bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            : "text-white/72 hover:bg-white/[0.04] hover:text-white",
        ].join(" ")}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex cursor-default items-center gap-3 rounded-2xl px-3 py-2.5 text-white/72">
      {content}
    </div>
  );
}

function StatusCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "healthy" | "warning";
  icon: ReactNode;
}) {
  const toneClasses =
    tone === "healthy"
      ? "border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.14)_0%,rgba(255,255,255,0.03)_100%)]"
      : "border-orange-400/20 bg-[linear-gradient(180deg,rgba(249,115,22,0.16)_0%,rgba(255,255,255,0.03)_100%)]";

  return (
    <div className={`rounded-[26px] border p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)] ${toneClasses}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/85">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        {action ?? null}
      </div>
      {children}
    </section>
  );
}

function CameraPreview({
  label,
  description,
  variant,
}: {
  label: string;
  description: string;
  variant: "front" | "living";
}) {
  const backgroundClass =
    variant === "front"
      ? "bg-[linear-gradient(180deg,rgba(16,24,40,0.05)_0%,rgba(4,7,12,0.2)_100%),radial-gradient(circle_at_18%_18%,rgba(255,223,128,0.38),transparent_18%),linear-gradient(145deg,#0f172a_0%,#1f2937_48%,#0b1220_100%)]"
      : "bg-[linear-gradient(180deg,rgba(16,24,40,0.05)_0%,rgba(4,7,12,0.2)_100%),radial-gradient(circle_at_68%_24%,rgba(255,230,180,0.32),transparent_18%),linear-gradient(145deg,#111827_0%,#1f2937_52%,#0b1220_100%)]";

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
      <div className={`relative aspect-[16/10] ${backgroundClass}`}>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          Live
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="mt-1 text-sm text-white/55">{description}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/65">
          <Camera className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function DeviceRow({
  icon,
  label,
  status,
  statusTone,
}: {
  icon: ReactNode;
  label: string;
  status: string;
  statusTone: "healthy" | "warning";
}) {
  const statusClass =
    statusTone === "healthy" ? "text-emerald-300" : "text-amber-300";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70">
          {icon}
        </div>
        <span className="truncate text-sm font-medium text-white">{label}</span>
      </div>
      <span className={`shrink-0 text-sm font-medium ${statusClass}`}>{status}</span>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:bg-white/[0.08]"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/75">
          {icon}
        </span>
        <span className="text-sm font-medium text-white">{label}</span>
      </span>
      <ChevronRight className="h-4 w-4 text-white/35" />
    </button>
  );
}

function SeverityDot({ severity }: { severity: AlertItem["severity"] }) {
  const classes =
    severity === "critical"
      ? "bg-red-400 shadow-[0_0_0_6px_rgba(248,113,113,0.12)]"
      : severity === "warning"
        ? "bg-amber-300 shadow-[0_0_0_6px_rgba(252,211,77,0.12)]"
        : "bg-sky-300 shadow-[0_0_0_6px_rgba(125,211,252,0.12)]";

  return <span className={`h-2.5 w-2.5 rounded-full ${classes}`} />;
}

function IconButton({
  children,
  ariaLabel,
}: {
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
    >
      {children}
    </button>
  );
}