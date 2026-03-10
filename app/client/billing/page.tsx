import { CreditCard, ReceiptText, Wallet } from "lucide-react"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import {
  EmptyPanelState,
  MetricCard,
  PageIntro,
  Panel,
  TonePill,
} from "@/components/client-security/ClientPortalPrimitives"
import { getClientPortalBilling } from "@/lib/security/portal"

export default async function ClientBillingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const data = await getClientPortalBilling(session.user.id)

  if (!data.property) {
    return (
      <div className="space-y-6">
        <PageIntro
          eyebrow="Billing"
          title="Prepare your billing history"
          description="Billing should be serious and truthful. This page now waits for real invoice records."
        />

        <Panel title="Billing onboarding">
          <EmptyPanelState
            title="No monitored property exists yet"
            description="Create a property first. Once billing records exist for that property, they will render here with real balances and statuses."
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
        eyebrow="Billing"
        title={`${data.property.name} billing`}
        description="Invoice history now comes from actual records. No invented balances, no pretend payment history."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label={data.metrics[0].label}
          value={data.metrics[0].value}
          helper={data.metrics[0].helper}
          tone={data.metrics[0].tone}
          icon={<ReceiptText className="h-5 w-5" />}
        />
        <MetricCard
          label={data.metrics[1].label}
          value={data.metrics[1].value}
          helper={data.metrics[1].helper}
          tone={data.metrics[1].tone}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <MetricCard
          label={data.metrics[2].label}
          value={data.metrics[2].value}
          helper={data.metrics[2].helper}
          tone={data.metrics[2].tone}
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <Panel title="Invoices">
          {data.invoices.length === 0 ? (
            <EmptyPanelState
              title="No invoices recorded yet"
              description="Once service plans or commercial charges are recorded for this property, they will appear here with due dates and payment state."
              actionHref="/client/documents"
              actionLabel="Open documents"
            />
          ) : (
            <div className="space-y-3">
              {data.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="mt-1 text-sm text-white/58">
                        Due {invoice.dueDateLabel}
                      </p>
                    </div>
                    <TonePill tone={invoice.tone} label={invoice.statusLabel} />
                  </div>

                  <p className="mt-3 text-lg font-semibold text-white">
                    {invoice.amountLabel}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div className="grid gap-6">
          <Panel title="Professional standard">
            <div className="space-y-3">
              <BillingNote
                title="No invented balances"
                description="Show money only when real invoice records exist."
              />
              <BillingNote
                title="Status clarity"
                description="Open, overdue, paid, and void should be driven by backend records."
              />
              <BillingNote
                title="Commercial trust"
                description="Billing becomes part of the product’s credibility, not just an admin afterthought."
              />
            </div>
          </Panel>

          <Panel title="Data-inviting language">
            <div className="space-y-3">
              <BillingPhrase
                label="No invoices recorded yet"
                note="Use when the property exists but no invoice records have been created."
              />
              <BillingPhrase
                label="No outstanding balance"
                note="Use when open and overdue totals equal zero."
              />
              <BillingPhrase
                label="Waiting for first billing cycle"
                note="Use when the customer is onboarded but billing has not started."
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function BillingNote({
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

function BillingPhrase({
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