"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { requestCancellation } from "@/lib/billing/actions"
import type { OwnerBillingData } from "@/lib/billing/getOwnerBilling"
import { pricePerTruck } from "@/lib/billing/pricing"
import { useLang } from "@/lib/i18n/LangProvider"
import { CORREO_CONTACTO } from "@/lib/utils/contacto"
import { updateContactPhone } from "@/lib/business/contactActions"
import { useOnboarding } from "./onboarding/OnboardingProvider"
import { Modal } from "./ui/Modal"
import { Button } from "./ui/Button"

export function CuentaScreen({
  billing,
  ownerEmail,
  phone,
  signInMethod,
  impersonating = false,
}: {
  billing: OwnerBillingData
  ownerEmail: string
  phone: string | null
  signInMethod: "google" | "password"
  impersonating?: boolean
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
      <div data-tour="onboarding-cuenta-title" className="panel-animate-in">
        <h1 className="mb-1 font-[family-name:var(--font-panel-display)] text-2xl font-bold text-panel-ink">{p.title}</h1>
        <p className="mb-2 text-sm text-panel-ink-soft">{p.subtitle}</p>
      </div>

      <div className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)]" style={{ animationDelay: "40ms" }}>
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-panel-ink/40">{p.yourPlan}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-[family-name:var(--font-panel-display)] text-3xl font-bold text-panel-ink">${billing.total}</span>
          <span className="text-sm text-panel-ink-soft">{p.perMonth}</span>
        </div>
        <p className="mt-1 text-sm text-panel-ink-soft">{p.activeTrucks(billing.activeTrucks, billing.pricePerTruck)}</p>
        <p className="mt-3 text-xs font-semibold text-emerald-700">{p.noCommission}</p>
      </div>

      <div className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)]" style={{ animationDelay: "80ms" }}>
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-panel-ink/40">{p.ladderTitle}</div>
        <p className="mb-3 text-xs text-panel-ink-soft">{p.ladderHint}</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-panel-line text-left text-[11px] font-bold uppercase tracking-wide text-panel-ink/40">
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
                <tr key={n} className={`border-b border-panel-line text-panel-ink last:border-0 ${isCurrent ? "bg-emerald-50 font-bold" : ""}`}>
                  <td className="py-2">
                    {n === 5 ? p.ladderFivePlus : n}
                    {isCurrent && <span className="ml-2 rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white">{p.ladderYourPlan}</span>}
                  </td>
                  <td className="py-2">${price}</td>
                  <td className="py-2">${n * price}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)]" style={{ animationDelay: "120ms" }}>
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-panel-ink/40">{p.subscriptionStatus}</div>
        <div className="font-semibold text-panel-ink">
          {STATUS_LABEL[billing.business?.subscription_status ?? ""] ?? billing.business?.subscription_status}
        </div>
        <p className="mt-1 text-xs text-panel-ink-soft">{p.billingNote}</p>
      </div>

      <div className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)]" style={{ animationDelay: "160ms" }}>
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-panel-ink/40">{p.moreTrucksTitle}</div>
        <p className="text-sm text-panel-ink-soft">
          {p.moreTrucksBody.split(p.trucksLink)[0]}
          <Link href="/panel/trucks" className="font-semibold text-panel-brand underline">
            {p.trucksLink}
          </Link>
          {p.moreTrucksBody.split(p.trucksLink)[1]}
        </p>
      </div>

      <div className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)]" style={{ animationDelay: "200ms" }}>
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-panel-ink/40">{p.howYouPayTitle}</div>
        <p className="mb-2 text-xs text-panel-ink/40">{p.howYouPayHint}</p>
        <p className="text-sm leading-relaxed text-panel-ink-soft">
          {billing.business?.billing_mode === "stripe" ? p.howYouPayStripe : p.howYouPayManual}
        </p>
      </div>

      <div className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)]" style={{ animationDelay: "240ms" }}>
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-panel-ink/40">
          {impersonating ? p.businessDataTitle : p.yourDataTitle}
        </div>
        <p className="mb-3 text-xs text-panel-ink/40">{impersonating ? p.businessDataHint : p.yourDataHint}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3 border-b border-panel-line pb-2">
            <span className="text-panel-ink-soft">{p.businessLabel}</span>
            <span className="font-semibold text-panel-ink">{billing.business?.name}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-panel-line pb-2">
            <span className="text-panel-ink-soft">{p.emailLabel}</span>
            <span className="font-semibold text-panel-ink">{ownerEmail}</span>
          </div>
          <PhoneRow phone={phone} p={p} />
          {/* El método de ingreso es de quien tiene la sesión. Viendo como
              admin sería el del admin, así que no se muestra. */}
          {!impersonating && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-panel-ink-soft">{p.signInLabel}</span>
              <span className="font-semibold text-panel-ink">{signInMethod === "google" ? p.signInGoogle : p.signInPassword}</span>
            </div>
          )}
        </div>
        <button
          data-tour="onboarding-restart"
          onClick={restartOnboarding}
          className="mt-4 text-xs font-bold text-panel-ink-soft underline decoration-panel-line hover:text-panel-ink"
        >
          {t.panel.onboarding.restartButton}
        </button>
      </div>

      <div className="panel-animate-in rounded-[20px] border border-dashed border-panel-line bg-panel-surface p-5" style={{ animationDelay: "280ms" }}>
        <div className="mb-1 text-sm font-bold text-panel-ink">{p.leaveTitle}</div>
        {sent ? (
          <p className="text-sm font-semibold text-emerald-700">{p.cancelSent}</p>
        ) : showCancel ? (
          <div className="space-y-2">
            <p className="text-sm text-panel-ink-soft">{p.cancelExplain}</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={p.notePlaceholder}
              className="w-full rounded-xl border border-panel-line bg-panel-bg/60 px-3.5 py-2.5 text-sm text-panel-ink outline-none transition-colors focus:border-panel-brand focus:bg-panel-surface focus:ring-4 focus:ring-panel-brand/10"
              rows={2}
            />
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={send}
                disabled={pending}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
              >
                {pending ? p.sendingLabel : p.sendRequest}
              </button>
              <a
                href={`mailto:${CORREO_CONTACTO}?subject=Quiero%20hablarlo`}
                className="rounded-lg border border-panel-line px-3 py-1.5 text-xs font-bold text-panel-ink transition-colors hover:border-panel-brand hover:text-panel-brand"
              >
                {p.wantToTalk}
              </a>
              <button onClick={() => setShowCancel(false)} className="text-xs text-panel-ink-soft hover:text-panel-ink">
                {t.panel.common.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConsequences(true)}
            className="text-xs font-semibold text-panel-ink/35 hover:text-rose-600"
          >
            {p.requestCancellation}
          </button>
        )}
      </div>

      {showConsequences && (
        <Modal size="lg">
          <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">{p.cancelConsequencesTitle}</h3>
          <p className="mb-3 text-sm text-panel-ink-soft">{p.cancelConsequencesIntro}</p>
          <ul className="mb-4 list-disc space-y-2 pl-5 text-sm text-panel-ink-soft">
            <li>{p.cancelConsequence1(billing.activeTrucks)}</li>
            <li>{p.cancelConsequence2}</li>
            <li>{p.cancelConsequence3}</li>
            <li>{p.cancelConsequence4}</li>
          </ul>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowConsequences(false)} className="px-3 py-2">
              {p.cancelKeepGoing}
            </Button>
            <a
              href={`mailto:${CORREO_CONTACTO}?subject=Quiero%20hablarlo`}
              className="rounded-xl border border-panel-line px-3 py-2.5 text-sm font-bold text-panel-ink transition-colors hover:border-panel-ink/20"
            >
              {p.wantToTalk}
            </a>
            <Button
              variant="dangerSolid"
              onClick={() => {
                setShowConsequences(false)
                setShowCancel(true)
              }}
            >
              {p.cancelContinue}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// 4054172392 → (405) 417-2392. Solo con exactamente 10 dígitos de EE. UU.;
// cualquier otra cosa se muestra tal cual la escribió el dueño, porque
// "arreglar" un número que no entendemos es peor que dejarlo.
function formatearTelefono(tel: string) {
  const d = tel.replace(/\D/g, "")
  const diez = d.length === 11 && d.startsWith("1") ? d.slice(1) : d
  if (diez.length !== 10) return tel
  return `(${diez.slice(0, 3)}) ${diez.slice(3, 6)}-${diez.slice(6)}`
}

// El teléfono de contacto, con edición en la misma fila. Llega de la solicitud
// de alta y el dueño lo corrige aquí si cambia de número — sin esto, un número
// viejo seguía siendo el único con el que podíamos llamarle.
function PhoneRow({
  phone,
  p,
}: {
  phone: string | null
  p: ReturnType<typeof useLang>["t"]["panel"]["cuentaPage"]
}) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor] = useState(phone ?? "")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function guardar() {
    setError(null)
    startTransition(async () => {
      const r = await updateContactPhone(valor)
      if (!r.ok) {
        setError(r.error === "Ese teléfono parece incompleto" ? r.error : p.phoneError)
        return
      }
      setEditando(false)
    })
  }

  return (
    <div className="border-b border-panel-line pb-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-panel-ink-soft">{p.phoneLabel}</span>
        {editando ? (
          <span className="flex items-center gap-2">
            <input
              type="tel"
              autoFocus
              autoComplete="tel"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") guardar()
                if (e.key === "Escape") setEditando(false)
              }}
              placeholder={p.phonePlaceholder}
              className="w-40 rounded-lg border border-panel-line bg-white px-2.5 py-1.5 text-sm text-panel-ink outline-none focus:border-panel-brand"
            />
            <button
              onClick={guardar}
              disabled={pending}
              className="rounded-lg bg-panel-brand px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-60"
            >
              {pending ? p.phoneSaving : p.phoneSave}
            </button>
            <button
              onClick={() => {
                setEditando(false)
                setValor(phone ?? "")
                setError(null)
              }}
              className="text-xs text-panel-ink-soft hover:text-panel-ink"
            >
              {p.phoneCancel}
            </button>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {phone ? (
              <span className="font-semibold text-panel-ink">{formatearTelefono(phone)}</span>
            ) : (
              <span className="text-panel-ink/40">{p.phoneEmpty}</span>
            )}
            <button
              onClick={() => setEditando(true)}
              className="text-xs font-bold text-panel-ink-soft underline decoration-panel-line hover:text-panel-ink"
            >
              {phone ? p.phoneEdit : p.phoneAdd}
            </button>
          </span>
        )}
      </div>
      {editando && <p className="mt-1.5 text-xs text-panel-ink/40">{p.phoneHint}</p>}
      {error && <p className="mt-1.5 text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  )
}
