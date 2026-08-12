"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { requestCancellation } from "@/lib/billing/actions"
import type { OwnerBillingData } from "@/lib/billing/getOwnerBilling"
import { pricePerTruck } from "@/lib/billing/pricing"
import { useLang } from "@/lib/i18n/LangProvider"
import { useOnboarding } from "./onboarding/OnboardingProvider"

export function CuentaScreen({
  billing,
  ownerEmail,
  signInMethod,
}: {
  billing: OwnerBillingData
  ownerEmail: string
  signInMethod: "google" | "password"
}) {
  const { t } = useLang()
  const p = t.panel.cuentaPage
  const { restart: restartOnboarding } = useOnboarding()
  const STATUS_LABEL: Record<string, string> = {
    trial: p.statusTrial,
    active: p.statusActive,
    suspended: p.statusSuspended,
    cancelled: p.statusCancelled,
  }
  const [showConsequences, setShowConsequences] = useState(false)
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
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">{p.howYouPayTitle}</div>
        <p className="mb-2 text-xs text-neutral-400">{p.howYouPayHint}</p>
        <p className="text-sm leading-relaxed text-neutral-600">
          {billing.business?.billing_mode === "stripe" ? p.howYouPayStripe : p.howYouPayManual}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">{p.yourDataTitle}</div>
        <p className="mb-3 text-xs text-neutral-400">{p.yourDataHint}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-2">
            <span className="text-neutral-500">{p.businessLabel}</span>
            <span className="font-semibold">{billing.business?.name}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-2">
            <span className="text-neutral-500">{p.emailLabel}</span>
            <span className="font-semibold">{ownerEmail}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-neutral-500">{p.signInLabel}</span>
            <span className="font-semibold">{signInMethod === "google" ? p.signInGoogle : p.signInPassword}</span>
          </div>
        </div>
        <button
          data-tour="onboarding-restart"
          onClick={restartOnboarding}
          className="mt-4 text-xs font-bold text-neutral-500 underline"
        >
          {t.panel.onboarding.restartButton}
        </button>
      </div>

      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-5">
        <div className="mb-1 text-sm font-bold">{p.leaveTitle}</div>
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
            onClick={() => setShowConsequences(true)}
            className="text-xs font-semibold text-neutral-400 hover:text-red-600"
          >
            {p.requestCancellation}
          </button>
        )}
      </div>

      {showConsequences && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
            <h3 className="mb-1.5 text-xl font-black">{p.cancelConsequencesTitle}</h3>
            <p className="mb-3 text-sm text-neutral-500">{p.cancelConsequencesIntro}</p>
            <ul className="mb-4 list-disc space-y-2 pl-5 text-sm text-neutral-600">
              <li>{p.cancelConsequence1(billing.activeTrucks)}</li>
              <li>{p.cancelConsequence2}</li>
              <li>{p.cancelConsequence3}</li>
              <li>{p.cancelConsequence4}</li>
            </ul>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setShowConsequences(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-neutral-500"
              >
                {p.cancelKeepGoing}
              </button>
              <a
                href="mailto:jetgosolutions@gmail.com?subject=Quiero%20hablarlo"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-700"
              >
                {p.wantToTalk}
              </a>
              <button
                onClick={() => {
                  setShowConsequences(false)
                  setShowCancel(true)
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white"
              >
                {p.cancelContinue}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
