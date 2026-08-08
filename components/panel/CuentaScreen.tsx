"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { requestCancellation } from "@/lib/billing/actions"
import type { OwnerBillingData } from "@/lib/billing/getOwnerBilling"
import { pricePerTruck } from "@/lib/billing/pricing"
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
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">{p.ladderTitle}</div>
        <p className="mb-3 text-xs text-neutral-500">{p.ladderHint}</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-[11px] font-bold uppercase tracking-wide text-neutral-400">
              <th className="pb-2 font-bold">{p.ladderTrucks}</th>
              <th className="pb-2 font-bold">{p.ladderPerTruck}</th>
              <th className="pb-2 font-bold">{p.ladderMonthly}</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((n) => {
              const isCurrent = n === billing.activeTrucks
              const price = pricePerTruck(n)
              return (
                <tr key={n} className={`border-b border-neutral-100 last:border-0 ${isCurrent ? "bg-green-50 font-bold" : ""}`}>
                  <td className="py-2">
                    {n === 5 ? p.ladderFivePlus : n}
                    {isCurrent && <span className="ml-2 rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-bold text-white">{p.ladderYourPlan}</span>}
                  </td>
                  <td className="py-2">${price}</td>
                  <td className="py-2">${n * price}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
            <div className="flex flex-wrap gap-2">
              <button
                onClick={send}
                disabled={pending}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
              >
                {pending ? p.sendingLabel : p.sendRequest}
              </button>
              <a
                href="mailto:jetgosolutions@gmail.com?subject=Quiero%20hablarlo"
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-700"
              >
                {p.wantToTalk}
              </a>
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
