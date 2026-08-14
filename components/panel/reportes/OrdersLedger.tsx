"use client"

import { useMemo, useState } from "react"
import type { OwnerSummary } from "@/lib/reportes/getOwnerSummary"
import type { Dictionary } from "@/lib/i18n/dictionary"

type LedgerOrder = OwnerSummary["ledger"][number]

const STATUS_KEY = {
  recibido: "lookupStatusRecibido",
  preparando: "lookupStatusPreparando",
  listo: "lookupStatusListo",
  entregado: "lookupStatusEntregado",
  cancelado: "lookupStatusCancelado",
} as const

function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10)
}

function csvEscape(v: string) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

// Solo lectura y solo filtra en memoria — los 30 días ya vienen del
// servidor (mismo dataset que el resto de Resumen), así que no hay consulta
// nueva por cada cambio de filtro, y funciona sin conexión mientras la
// pantalla siga abierta.
export function OrdersLedger({
  orders,
  trucks,
  t,
  lang,
}: {
  orders: LedgerOrder[]
  trucks: { unitId: string; name: string }[]
  t: Dictionary
  lang: "es" | "en"
}) {
  const p = t.panel.resumenPage
  const k = t.kitchen
  const today = useMemo(() => new Date(), [])
  const defaultFrom = useMemo(() => toDateInputValue(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)), [today])

  const [open, setOpen] = useState(false)
  const [truckId, setTruckId] = useState("todos")
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(toDateInputValue(today))
  const [method, setMethod] = useState("todos")
  const [status, setStatus] = useState("todos")
  const [channel, setChannel] = useState("todos")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity
    const toTime = to ? new Date(`${to}T23:59:59`).getTime() : Infinity
    const q = search.trim().toLowerCase()

    return orders.filter((o) => {
      if (truckId !== "todos" && o.unitId !== truckId) return false
      const created = new Date(o.createdAt).getTime()
      if (created < fromTime || created > toTime) return false
      if (method !== "todos" && o.paymentMethod !== method) return false
      if (status !== "todos" && o.paymentStatus !== status) return false
      if (channel !== "todos" && o.channel !== channel) return false
      if (q) {
        const matchesFolio = o.folio !== null && String(o.folio).includes(q)
        const matchesName = (o.customerName ?? "").toLowerCase().includes(q)
        if (!matchesFolio && !matchesName) return false
      }
      return true
    })
  }, [orders, truckId, from, to, method, status, channel, search])

  function exportCsv() {
    const header = ["Folio", "Fecha", "Truck", "Canal", "Estado", "Pago", "Medio", "Cliente", "Pedido", "Total"]
    const rows = filtered.map((o) => [
      String(o.folio ?? ""),
      new Date(o.createdAt).toLocaleString(lang === "es" ? "es-MX" : "en-US"),
      o.unitName,
      o.channel === "ventanilla" ? p.ledgerChannelVentanilla : p.ledgerChannelQr,
      k[STATUS_KEY[o.status as keyof typeof STATUS_KEY]] ?? o.status,
      o.paymentStatus === "pagada" ? p.ledgerStatusPaid : p.ledgerStatusUnpaid,
      o.paymentMethod ?? "",
      o.customerName ?? "",
      o.itemsSummary,
      o.total.toFixed(2),
    ])
    const csv = [header, ...rows].map((r) => r.map((c) => csvEscape(String(c))).join(",")).join("\n")
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pedidos_${from}_${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectClass =
    "rounded-lg border border-panel-line bg-panel-bg px-2.5 py-1.5 text-xs font-semibold text-panel-ink"

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 flex-none text-panel-ink-soft transition-transform duration-150 ${open ? "" : "-rotate-90"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        <Eyebrow>{p.ledgerTitle}</Eyebrow>
      </button>

      {!open && <p className="mt-0.5 text-xs text-panel-ink-soft">{p.ledgerSubtitle}</p>}

      {open && (
        <>
      <p className="mb-3 mt-1.5 text-xs text-panel-ink-soft">{p.ledgerSubtitle}</p>

      <div className="mb-3 flex flex-wrap items-end gap-2">
        {trucks.length > 1 && (
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-panel-ink-soft">{p.ledgerFilterTruck}</span>
            <select value={truckId} onChange={(e) => setTruckId(e.target.value)} className={selectClass}>
              <option value="todos">{p.ledgerFilterAllTrucks}</option>
              {trucks.map((tr) => (
                <option key={tr.unitId} value={tr.unitId}>
                  {tr.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-panel-ink-soft">{p.ledgerFilterFrom}</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-panel-ink-soft">{p.ledgerFilterTo}</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={selectClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-panel-ink-soft">{p.ledgerFilterPaymentMethod}</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={selectClass}>
            <option value="todos">{p.ledgerFilterAllMethods}</option>
            <option value="efectivo">{k.paymentMethodCash}</option>
            <option value="tarjeta">{k.paymentMethodCard}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-panel-ink-soft">{p.ledgerFilterPaymentStatus}</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            <option value="todos">{p.ledgerFilterAllStatuses}</option>
            <option value="pagada">{p.ledgerStatusPaid}</option>
            <option value="pendiente">{p.ledgerStatusUnpaid}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-panel-ink-soft">{p.ledgerFilterChannel}</span>
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className={selectClass}>
            <option value="todos">{p.ledgerFilterAllChannels}</option>
            <option value="qr">{p.ledgerChannelQr}</option>
            <option value="ventanilla">{p.ledgerChannelVentanilla}</option>
          </select>
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={p.ledgerSearchPlaceholder}
          className="min-w-[160px] flex-1 rounded-lg border border-panel-line bg-panel-bg px-2.5 py-1.5 text-xs font-semibold text-panel-ink"
        />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-bold text-panel-ink-soft">{p.ledgerShowingCount(filtered.length)}</p>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="text-[11px] font-semibold text-panel-ink-soft underline decoration-panel-line underline-offset-2 hover:text-panel-brand disabled:opacity-40"
        >
          {p.ledgerExport}
        </button>
      </div>

      <div className="max-h-[420px] overflow-auto rounded-xl border border-panel-line">
        {filtered.length === 0 ? (
          <p className="p-5 text-center text-sm text-panel-ink-soft">{p.ledgerEmpty}</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-panel-surface">
              <tr className="border-b border-panel-line text-[10px] font-bold uppercase tracking-wide text-panel-ink-soft">
                <th className="px-3 py-2">{p.ledgerColFolio}</th>
                <th className="px-3 py-2">{p.ledgerColDate}</th>
                <th className="px-3 py-2">{p.ledgerColTruck}</th>
                <th className="px-3 py-2">{p.ledgerColChannel}</th>
                <th className="px-3 py-2">{p.ledgerColStatus}</th>
                <th className="px-3 py-2">{p.ledgerColPayment}</th>
                <th className="px-3 py-2 text-right">{p.ledgerColTotal}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-panel-line last:border-0">
                  <td className="px-3 py-2 font-bold tabular-nums">#{o.folio ?? "—"}</td>
                  <td className="px-3 py-2 text-panel-ink-soft">
                    {new Date(o.createdAt).toLocaleString(lang === "es" ? "es-MX" : "en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-3 py-2">{o.unitName}</td>
                  <td className="px-3 py-2 text-panel-ink-soft">
                    {o.channel === "ventanilla" ? p.ledgerChannelVentanilla : p.ledgerChannelQr}
                  </td>
                  <td className="px-3 py-2 text-panel-ink-soft">
                    {k[STATUS_KEY[o.status as keyof typeof STATUS_KEY]] as string | undefined}
                  </td>
                  <td className="px-3 py-2">
                    <span className={o.paymentStatus === "pagada" ? "text-emerald-600" : "text-amber-600"}>
                      {o.paymentStatus === "pagada" ? p.ledgerStatusPaid : p.ledgerStatusUnpaid}
                    </span>
                    {o.paymentMethod && (
                      <span className="text-panel-ink-soft"> · {o.paymentMethod === "tarjeta" ? k.paymentMethodCard : k.paymentMethodCash}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-bold tabular-nums">${o.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
        </>
      )}
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-wider text-panel-ink-soft">{children}</div>
}
