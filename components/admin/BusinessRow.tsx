"use client"

import { useState, useTransition } from "react"
import { suspendBusiness, reactivateBusiness, setTrialEnd } from "@/lib/admin/actions"
import { getTrialInfo } from "@/lib/billing/trial"
import { startImpersonation } from "@/lib/admin/impersonate"
import { useLang } from "@/lib/i18n/LangProvider"
import type { AdminOverview } from "@/lib/admin/getAdminOverview"

const STATUS_STYLE: Record<string, string> = {
  trial: "bg-blue-950 text-blue-300",
  active: "bg-green-950 text-green-300",
  suspended: "bg-red-950 text-red-300",
  cancelled: "bg-neutral-800 text-neutral-400",
}

export function BusinessRow({ business }: { business: AdminOverview["businesses"][number] }) {
  const { t } = useLang()
  const a = t.admin
  const STATUS_LABEL: Record<string, string> = {
    trial: a.statusTrial,
    active: a.statusActive,
    suspended: a.statusSuspended,
    cancelled: a.statusCancelled,
  }
  const [pending, startTransition] = useTransition()
  const [eligiendoVuelta, setEligiendoVuelta] = useState(false)

  // Sin fecha no hay vencimiento: es un estado válido, no un dato faltante.
  const trial = getTrialInfo(business.subscription_status, business.trial_ends_at)
  const trialLabel = !business.trial_ends_at
    ? { texto: a.trialNoLimit, urgente: false }
    : trial.expired
      ? { texto: a.trialExpired, urgente: true }
      : { texto: a.trialDaysLeft(trial.daysLeft ?? 0), urgente: trial.showWarning }

  return (
    <tr className="border-b border-neutral-800">
      <td className="py-2.5 pr-3">
        <div className="font-semibold">{business.name}</div>
        <div className="text-xs text-neutral-500">/{business.slug}</div>
      </td>
      <td className="py-2.5 pr-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[business.subscription_status] ?? "bg-neutral-800 text-neutral-400"}`}>
          {STATUS_LABEL[business.subscription_status] ?? business.subscription_status}
        </span>
        {business.subscription_status === "trial" && (
          <div className="mt-1.5 flex items-center gap-1.5">
            {/* El calendario solo aparece en prueba: fuera de ese estado la
                fecha no la lee nadie, y mostrarla confundiría. */}
            <input
              type="date"
              disabled={pending}
              defaultValue={business.trial_ends_at ? business.trial_ends_at.slice(0, 10) : ""}
              onChange={(e) =>
                startTransition(async () => {
                  const v = e.target.value
                  // Fin del día elegido: la prueba dura ese día completo.
                  await setTrialEnd(business.id, v ? new Date(`${v}T23:59:59`).toISOString() : null)
                })
              }
              className="rounded border border-neutral-700 bg-neutral-900 px-1.5 py-0.5 text-[11px] text-neutral-300"
            />
            <span className={`text-[11px] ${trialLabel.urgente ? "text-amber-400" : "text-neutral-500"}`}>
              {trialLabel.texto}
            </span>
          </div>
        )}
      </td>
      <td className="py-2.5 pr-3 text-sm">{business.activeTrucks}</td>
      <td className="py-2.5 pr-3 text-sm font-semibold">
        ${business.total}
        {a.perMonth}
      </td>
      <td className="py-2.5 pr-3 text-xs text-neutral-500">
        {business.billing_mode === "stripe" ? a.payStripe : a.payManual}
      </td>
      <td className="py-2.5 text-right">
        <div className="flex justify-end gap-1.5">
          {business.subscription_status === "suspended" ? (
            <span className="cursor-not-allowed rounded-lg border border-neutral-800 px-2.5 py-1 text-xs font-bold text-neutral-600" title={a.openDisabled}>
              {a.openLink}
            </span>
          ) : (
            <form action={startImpersonation.bind(null, business.id)}>
              <button className="rounded-lg border border-neutral-700 px-2.5 py-1 text-xs font-bold text-neutral-300 hover:border-neutral-500">
                {a.openLink}
              </button>
            </form>
          )}
          {business.subscription_status === "suspended" ? (
            eligiendoVuelta ? (
              // Se pregunta siempre: volver como prueba o de pago no es lo
              // mismo, y asumirlo en silencio ya nos costó una cuenta mal
              // convertida.
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-neutral-500">{a.reactivateAsk}</span>
                <button
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await reactivateBusiness(business.id, "trial")
                      setEligiendoVuelta(false)
                    })
                  }
                  className="rounded-lg border border-blue-800 px-2.5 py-1 text-xs font-bold text-blue-300"
                >
                  {a.reactivateAsTrial}
                </button>
                <button
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await reactivateBusiness(business.id, "active")
                      setEligiendoVuelta(false)
                    })
                  }
                  className="rounded-lg border border-green-800 px-2.5 py-1 text-xs font-bold text-green-300"
                >
                  {a.reactivateAsPaid}
                </button>
                <button onClick={() => setEligiendoVuelta(false)} className="text-xs text-neutral-500">
                  {a.cancel}
                </button>
              </div>
            ) : (
              <button
                disabled={pending}
                onClick={() => setEligiendoVuelta(true)}
                className="rounded-lg border border-green-800 px-2.5 py-1 text-xs font-bold text-green-300"
              >
                {a.reactivate}
              </button>
            )
          ) : (
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await suspendBusiness(business.id)
                })
              }
              className="rounded-lg border border-neutral-700 px-2.5 py-1 text-xs font-bold text-neutral-300 hover:border-red-800 hover:text-red-300"
            >
              {a.suspend}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
