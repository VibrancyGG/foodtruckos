"use client"

import { useState, useTransition } from "react"
import { createPortal } from "react-dom"
import { exportBusiness, deleteBusiness } from "@/lib/admin/actions"
import { useLang } from "@/lib/i18n/LangProvider"

// Eliminar un negocio para siempre.
//
// No reusa components/panel/ui/Modal porque aquel está vestido para el panel
// del dueño (fondo claro, tokens de esa marca) y el admin es oscuro; meterlo
// aquí se vería como una ventana de otra aplicación.
//
// La pantalla está construida alrededor de una idea: que sea imposible borrar
// un negocio distraído. Por eso son dos pasos con candado —primero se guarda
// el respaldo, después se escribe el nombre— y por eso el inventario no
// aparece hasta después de descargar: los números salen del respaldo real que
// el admin acaba de guardar, no de una estimación que podría no cuadrar con lo
// que se va a destruir.

type Respaldo = Record<string, unknown>

function cuenta(r: Respaldo | null, clave: string) {
  const v = r?.[clave]
  return Array.isArray(v) ? v.length : 0
}

export function DeleteBusinessModal({
  business,
  onClose,
}: {
  business: { id: string; name: string; slug: string }
  onClose: () => void
}) {
  const { t } = useLang()
  const a = t.admin

  const [respaldo, setRespaldo] = useState<Respaldo | null>(null)
  const [escrito, setEscrito] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [listo, setListo] = useState(false)
  const [pending, startTransition] = useTransition()

  // Comparación exacta, sin recortar ni ignorar mayúsculas: el nombre se
  // escribe tal cual o no se borra nada. La base lo vuelve a comprobar.
  const coincide = escrito === business.name

  function descargar() {
    setError(null)
    startTransition(async () => {
      const r = await exportBusiness(business.id)
      if (!r.ok) {
        setError(r.error)
        return
      }
      const datos = r.data as Respaldo
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const enlace = document.createElement("a")
      enlace.href = url
      enlace.download = `pavessa-respaldo-${business.slug}-${new Date().toISOString().slice(0, 10)}.json`
      enlace.click()
      URL.revokeObjectURL(url)
      setRespaldo(datos)
    })
  }

  function eliminar() {
    setError(null)
    startTransition(async () => {
      const r = await deleteBusiness(business.id, escrito)
      if (!r.ok) {
        setError(r.error)
        return
      }
      setListo(true)
    })
  }

  if (typeof document === "undefined") return null

  const filas = respaldo
    ? [
        a.deleteCountUnits(cuenta(respaldo, "units")),
        a.deleteCountOrders(cuenta(respaldo, "orders")),
        a.deleteCountProducts(cuenta(respaldo, "products")),
        a.deleteCountStaff(cuenta(respaldo, "staff")),
        a.deleteCountDevices(cuenta(respaldo, "devices")),
        a.deleteCountPhotos,
        a.deleteCountAccounts,
      ]
    : []

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-red-900/60 bg-neutral-900 p-6 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)]"
      >
        {listo ? (
          <>
            <h2 className="mb-4 text-lg font-black text-neutral-50">{a.deleteDone(business.name)}</h2>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-white py-2.5 text-sm font-black text-neutral-900"
            >
              {a.cancel}
            </button>
          </>
        ) : (
          <>
            <h2 className="mb-1.5 text-lg font-black text-red-300">{a.deleteTitle}</h2>
            <p className="mb-5 text-sm leading-relaxed text-neutral-300">{a.deleteLead(business.name)}</p>

            {/* Paso 1 — el respaldo. Sin esto no se habilita nada más. */}
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">{a.deleteStep1}</p>
            {respaldo ? (
              <p className="mb-5 text-sm font-bold text-emerald-400">✓ {a.deleteStep1Done}</p>
            ) : (
              <button
                disabled={pending}
                onClick={descargar}
                className="mb-5 w-full rounded-xl border border-neutral-700 py-2.5 text-sm font-bold text-neutral-200 hover:border-neutral-500 disabled:opacity-50"
              >
                {a.deleteStep1Button}
              </button>
            )}

            {respaldo && (
              <>
                <p className="mb-2 text-sm font-semibold text-neutral-200">{a.deleteInventory}</p>
                <ul className="mb-3 space-y-1">
                  {filas.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-neutral-400">
                      <span className="text-red-500">·</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mb-5 text-xs leading-relaxed text-neutral-500">{a.deleteKeeps}</p>

                {/* Paso 2 — escribir el nombre. */}
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">
                  {a.deleteStep2(business.name)}
                </p>
                <input
                  value={escrito}
                  onChange={(e) => setEscrito(e.target.value)}
                  placeholder={a.deleteConfirmPlaceholder}
                  autoComplete="off"
                  className="mb-4 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-50 placeholder:text-neutral-600"
                />
                <button
                  disabled={!coincide || pending}
                  onClick={eliminar}
                  className="w-full rounded-xl bg-red-700 py-2.5 text-sm font-black text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pending ? a.deleteWorking : a.deleteFinal}
                </button>
              </>
            )}

            {error && <p className="mt-3 text-sm font-semibold text-amber-400">{error}</p>}

            <button
              onClick={onClose}
              disabled={pending}
              className="mt-3 w-full py-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-300"
            >
              {a.cancel}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
