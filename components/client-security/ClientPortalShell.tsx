"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  BellRing,
  Camera,
  Cpu,
  FileText,
  LayoutDashboard,
  MapPinned,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Wrench,
} from "lucide-react"

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/client/overview", icon: LayoutDashboard },
  { label: "Property Map", href: "/client/property-map", icon: MapPinned },
  { label: "Devices", href: "/client/devices", icon: Cpu },
  { label: "Alerts", href: "/client/alerts", icon: BellRing },
  { label: "Cameras", href: "/client/cameras", icon: Camera },
  { label: "Service", href: "/client/service", icon: Wrench },
  { label: "Billing", href: "/client/billing", icon: ReceiptText },
  { label: "Documents", href: "/client/documents", icon: FileText },
]

const titleByPath: Record<string, string> = {
  "/client/overview": "Home Security",
  "/client/property-map": "Property Map",
  "/client/devices": "Devices",
  "/client/alerts": "Alerts",
  "/client/cameras": "Cameras",
  "/client/service": "Service",
  "/client/billing": "Billing",
  "/client/documents": "Documents",
}

export function ClientPortalShell({
  children,
  userLabel,
  userInitials,
}: {
  children: ReactNode
  userLabel: string
  userInitials: string
}) {
  const pathname = usePathname()
  const pageTitle = titleByPath[pathname] ?? "Client Security"

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_26%),linear-gradient(180deg,_#05070b_0%,_#070b12_45%,_#040507_100%)] text-white">
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
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition",
                          active
                            ? "bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                            : "text-white/72 hover:bg-white/[0.04] hover:text-white",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "flex h-10 w-10 items-center justify-center rounded-2xl border transition",
                            active
                              ? "border-sky-400/25 bg-sky-500/10 text-sky-200"
                              : "border-white/10 bg-white/[0.03] text-white/65",
                          ].join(" ")}
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="border-t border-white/10 px-4 py-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  Operations
                </p>
                <p className="mt-3 text-sm font-medium text-white">
                  Security command center foundation is now in place.
                </p>
                <p className="mt-1 text-sm leading-6 text-white/60">
                  Next we can harden it with real models, server queries, and camera ingest.
                </p>
              </div>
            </div>
          </aside>

          <section className="min-w-0 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,22,0.96)_0%,rgba(7,11,18,0.96)_100%)] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200/70">
                  Client Security Center
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {pageTitle}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex h-11 min-w-[240px] items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/60">
                  <Search className="h-4 w-4 text-white/45" />
                  <input
                    type="text"
                    placeholder="Search devices, alerts, or notes"
                    className="w-full bg-transparent outline-none placeholder:text-white/45"
                  />
                </label>

                <button
                  type="button"
                  aria-label="Notifications"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <BellRing className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  aria-label="Settings"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <Settings2 className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(244,114,182,0.18)_0%,rgba(59,130,246,0.14)_100%)] text-sm font-semibold text-white">
                    {userInitials}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-white">{userLabel}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                      Authenticated client
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">{children}</div>
          </section>
        </div>
      </div>
    </div>
  )
}