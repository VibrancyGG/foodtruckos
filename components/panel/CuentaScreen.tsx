"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { requestCancellation } from "@/lib/billing/actions"
import type { OwnerBillingData } from "@/lib/billing/getOwnerBilling"
import { useLang } from "@/lib/i18n/LangProvider"

export function CuentaScreen({ billing }: { billing: OwnerBillingData }) {
  const { t } = useLang()
  const p = t.panel.cuentaPage
  const STATUS_LABEL: Record<string, string> = {
    trial: p.statusTrial,
    active: p.statusActive,
    suspended: p.statusSuspended,
    cancelled: p.statusCancelled,
  }
  const [showCancel, setShowCancel] = useState(false)
  const [note, setNote] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function send() {
    setError(null)
    startTransition(async () => {
      const result = await requestCancellation(note)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSent(true)
      setShowCancel(false)
    })
  }

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="mb-1 text-2xl font-black">{p.title}</h1>
        <p className="mb-2 text-sm text-neutral-500">{p.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">{p.yourPlan}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black">${billing.total}</span>
          <span className="text-sm text-neutral-500">{p.perMonth}</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">{p.activeTrucks(billing.activeTrucks, billing.pricePerTruck)}</p>
        <p className="mt-3 text-xs font-semibold text-green-700">{p.noCommission}</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">{p.subscriptionStatus}</div>
        <div className="font-semibold">
          {STATUS_LABEL[billing.business?.subscription_status ?? ""] ?? billing.business?.subscription_status}
        </div>
        <p className="mt-1 text-xs text-neutral-500">{p.billingNote}</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">{p.moreTrucksTitle}</div>
        <p className="text-sm text-neutral-500">
          {p.moreTrucksBody.split(p.trucksLink)[0]}
          <Link href="/panel/trucks" className="font-semibold underline">
            {p.trucksLink}
          </Link>
          {p.moreTrucksBody.split(p.trucksLink)[1]}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        {sent ? (
          <p className="text-sm font-semibold text-green-700">{p.cancelSent}</p>
        ) : showCancel ? (
          <div className="space-y-2">
            <p className="text-sm text-neutral-600">{p.cancelExplain}</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={p.notePlaceholder}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              rows={2}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={send}
                disabled={pending}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
              >
                {pending ? p.sendingLabel : p.sendRequest}
              </button>
              <button onClick={() => setShowCancel(false)} className="text-xs text-neutral-500">
                {t.panel.common.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCancel(true)}
            className="text-xs font-semibold text-neutral-400 hover:text-red-600"
          >
            {p.requestCancellation}
          </button>
        )}
      </div>
    </div>
  )
}
