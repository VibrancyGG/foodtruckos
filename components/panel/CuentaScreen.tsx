"use client"

import { useState, useTransition } from "react"
import { requestCancellation } from "@/lib/billing/actions"
import type { OwnerBillingData } from "@/lib/billing/getOwnerBilling"

const STATUS_LABEL: Record<string, string> = {
  trial: "Periodo de prueba",
  active: "Activa",
  suspended: "Suspendida",
  cancelled: "Cancelada",
}

export function CuentaScreen({ billing }: { billing: OwnerBillingData }) {
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
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">
          Tu plan
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black">${billing.total}</span>
          <span className="text-sm text-neutral-500">/ mes</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          {billing.activeTrucks} truck{billing.activeTrucks === 1 ? "" : "s"} activo
          {billing.activeTrucks === 1 ? "" : "s"} · ${billing.pricePerTruck} por truck
        </p>
        <p className="mt-3 text-xs font-semibold text-green-700">
          Sin comisión por pedido, nunca.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">
          Estado de tu suscripción
        </div>
        <div className="font-semibold">
          {STATUS_LABEL[billing.business?.subscription_status ?? ""] ??
            billing.business?.subscription_status}
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          En esta fase, cambios de plan y facturación los procesa nuestro equipo — nunca
          automático todavía.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">
          ¿Necesitas más trucks o menos?
        </div>
        <p className="text-sm text-neutral-500">
          Agregar o dar de baja un truck se hace desde{" "}
          <a href="/panel/trucks" className="font-semibold underline">
            Trucks
          </a>{" "}
          — tu plan se ajusta solo al siguiente ciclo, nunca a la mitad del mes.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        {sent ? (
          <p className="text-sm font-semibold text-green-700">
            Recibimos tu solicitud. Te contactamos para confirmar la cancelación — nada se
            cancela todavía.
          </p>
        ) : showCancel ? (
          <div className="space-y-2">
            <p className="text-sm text-neutral-600">
              Cuéntanos por qué, si quieres — nos ayuda a mejorar. Esto no cancela nada por sí
              solo; te contactamos para confirmar.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Opcional"
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
                {pending ? "Enviando…" : "Enviar solicitud"}
              </button>
              <button onClick={() => setShowCancel(false)} className="text-xs text-neutral-500">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCancel(true)}
            className="text-xs font-semibold text-neutral-400 hover:text-red-600"
          >
            Solicitar cancelación de mi suscripción
          </button>
        )}
      </div>
    </div>
  )
}
