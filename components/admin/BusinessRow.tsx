"use client"

import { useState, useTransition } from "react"
import { suspendBusiness, reactivateBusiness, setTrialEnd, sendOwnerRecovery } from "@/lib/admin/actions"
import { getTrialInfo } from "@/lib/billing/trial"
import { startImpersonation } from "@/lib/admin/impersonate"
import { useLang } from "@/lib/i18n/LangProvider"
import { DeleteBusinessModal } from "@/components/admin/DeleteBusinessModal"
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
  const [editandoFecha, setEditandoFecha] = useState(false)
  const [confirmandoEnlace, setConfirmandoEnlace] = useState(false)
  const [resultadoEnlace, setResultadoEnlace] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState(false)

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
          <div className="mt-1.5">
            {editandoFecha ? (
              <TrialEditor
                business={business}
                onDone={() => setEditandoFecha(false)}
                labels={a}
              />
            ) : (
              <button
                onClick={() => setEditandoFecha(true)}
                className={`text-[11px] underline decoration-dotted underline-offset-2 ${trialLabel.urgente ? "text-amber-400" : "text-neutral-500"} hover:text-neutral-200`}
              >
                {trialLabel.texto}
              </button>
            )}
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

          {/* Manda el mismo correo que el dueño se manda a sí mismo. Se
              pregunta antes porque es una acción que sale del producto: le
              llega un correo a una persona real. */}
          {confirmandoEnlace ? (
            <span className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-400">{a.recoveryConfirm}</span>
              <button
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const r = await sendOwnerRecovery(business.id)
                    setConfirmandoEnlace(false)
                    setResultadoEnlace(r.ok ? a.recoverySent(r.email ?? "") : r.error)
                  })
                }
                className="rounded-lg border border-blue-800 px-2.5 py-1 text-xs font-bold text-blue-300"
              >
                {a.recoverySend}
              </button>
              <button onClick={() => setConfirmandoEnlace(false)} className="px-1 text-xs text-neutral-500">
                {a.cancel}
              </button>
            </span>
          ) : (
            <button
              disabled={pending}
              onClick={() => {
                setResultadoEnlace(null)
                setConfirmandoEnlace(true)
              }}
              title={a.recoveryHint}
              className="rounded-lg border border-neutral-700 px-2.5 py-1 text-xs font-bold text-neutral-300 hover:border-blue-800 hover:text-blue-300"
            >
              {a.recoveryButton}
            </button>
          )}

          {resultadoEnlace && <span className="text-xs font-semibold text-neutral-400">{resultadoEnlace}</span>}

          {/* Aparte del resto y en rojo porque es el unico boton de esta fila
              que no se puede deshacer. La confirmacion de verdad (respaldo +
              escribir el nombre) vive dentro del modal, no aqui. */}
          <button
            disabled={pending}
            onClick={() => setEliminando(true)}
            className="ml-auto rounded-lg border border-neutral-800 px-2.5 py-1 text-xs font-bold text-neutral-500 hover:border-red-800 hover:text-red-400"
          >
            {a.deleteButton}
          </button>

          {eliminando && (
            <DeleteBusinessModal
              business={{ id: business.id, name: business.name, slug: business.slug }}
              onClose={() => setEliminando(false)}
            />
          )}
        </div>
      </td>
    </tr>
  )
}

// Editor de la fecha de prueba.
//
// La versión anterior guardaba en cada tecla del calendario: al escribir la
// fecha, el primer dígito ya disparaba un guardado con valor incompleto y
// borraba lo que se estaba escribiendo. Por eso no se dejaba cambiar.
//
// Ahora nada se guarda hasta que se pide. Y arriba están los atajos, porque
// lo que de verdad se hace el 90% de las veces es "dale una semana más", no
// elegir un martes concreto.
function TrialEditor({
  business,
  onDone,
  labels,
}: {
  business: AdminOverview["businesses"][number]
  onDone: () => void
  labels: { trialSave: string; trialNoLimit: string; trialSetDays: (n: number) => string; cancel: string }
}) {
  const [pending, startTransition] = useTransition()
  const [valor, setValor] = useState(business.trial_ends_at ? business.trial_ends_at.slice(0, 10) : "")

  // Fin del día elegido: la prueba dura ese día completo, no hasta la
  // medianoche anterior.
  const guardar = (iso: string | null) =>
    startTransition(async () => {
      await setTrialEnd(business.id, iso)
      onDone()
    })

  const enDias = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() + n)
    d.setHours(23, 59, 59, 0)
    return d.toISOString()
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input
        type="date"
        value={valor}
        disabled={pending}
        onChange={(e) => setValor(e.target.value)}
        className="rounded border border-neutral-600 bg-neutral-900 px-2 py-1 text-xs text-neutral-100"
      />
      <button
        disabled={pending}
        onClick={() => guardar(valor ? new Date(`${valor}T23:59:59`).toISOString() : null)}
        className="rounded-lg border border-green-800 px-2.5 py-1 text-xs font-bold text-green-300"
      >
        {labels.trialSave}
      </button>
      {[7, 14, 30].map((n) => (
        <button
          key={n}
          disabled={pending}
          onClick={() => guardar(enDias(n))}
          className="rounded-lg border border-neutral-700 px-2 py-1 text-xs font-bold text-neutral-300 hover:border-neutral-500"
        >
          {labels.trialSetDays(n)}
        </button>
      ))}
      <button
        disabled={pending}
        onClick={() => guardar(null)}
        className="rounded-lg border border-neutral-700 px-2 py-1 text-xs font-bold text-neutral-400 hover:border-neutral-500"
      >
        {labels.trialNoLimit}
      </button>
      <button onClick={onDone} className="px-1 text-xs text-neutral-500">
        {labels.cancel}
      </button>
    </div>
  )
}
