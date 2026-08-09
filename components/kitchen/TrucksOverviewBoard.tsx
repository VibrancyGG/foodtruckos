"use client"

import { useLang } from "@/lib/i18n/LangProvider"
import type { TrucksOverview } from "@/lib/kitchen/getTrucksOverview"

const LEVEL_COLOR: Record<string, string> = { amber: "#F5A524", red: "#E5484D" }

export function TrucksOverviewBoard({
  overview,
  staffName,
  ownUnitId,
  onViewTruck,
}: {
  overview: TrucksOverview
  staffName: string
  ownUnitId: string
  onViewTruck: (unitId: string) => void
}) {
  const { lang, setLang, t } = useLang()

  return (
    <div className="flex h-screen flex-col overflow-y-auto" style={{ background: "#100F0D", color: "#F6F3ED" }}>
      <header className="flex flex-none flex-wrap items-center gap-3.5 border-b px-4.5 py-3" style={{ background: "#1B1917", borderColor: "#332F29" }}>
        <div className="text-[15px] font-bold tracking-tight">
          {t.kitchen.trucksOverviewTitle} {staffName && <span className="font-semibold text-neutral-400">· {staffName}</span>}
        </div>
        <button
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          className="ml-auto rounded-full border px-2.5 py-1.5 text-xs font-bold"
          style={{ borderColor: "#332F29", color: "#F6F3ED" }}
        >
          {lang === "es" ? "EN" : "ES"}
        </button>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4.5 py-5">
        <p className="mb-4 text-sm font-semibold text-neutral-400">{t.kitchen.trucksOverviewSubtitle}</p>

        <div className="mb-6 rounded-xl border p-4" style={{ borderColor: "#332F29", background: "#1B1917" }}>
          <div className="text-[11px] font-black uppercase tracking-wide text-neutral-400">{t.kitchen.trucksOverviewSalesToday}</div>
          <div className="mt-1 text-3xl font-black tracking-tight">${overview.salesTodayTotal.toFixed(2)}</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {overview.trucks.map((truck) => (
            <div
              key={truck.id}
              className="flex flex-col rounded-2xl border p-4"
              style={{
                borderColor: truck.level === "red" ? "#8C2E32" : "#332F29",
                background: "#1B1917",
                boxShadow: truck.level === "red" ? "0 0 0 3px #3A1E1F" : undefined,
              }}
            >
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">{truck.name}</h2>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={truck.paused ? { background: "#3A2E1A", color: "#F5A524" } : { background: "#1C3327", color: "#4ADE80" }}
                >
                  {truck.paused ? t.kitchen.truckPausedPill : t.kitchen.truckOpenPill}
                </span>
              </div>
              {truck.location && <p className="mt-0.5 text-xs font-medium text-neutral-400">{truck.location}</p>}

              <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg border" style={{ borderColor: "#332F29", background: "#332F29" }}>
                <div className="p-2.5 text-center" style={{ background: "#232019" }}>
                  <b className="block text-2xl font-black leading-none">{truck.nuevas}</b>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-neutral-400">{t.kitchen.truckNewLabel}</span>
                </div>
                <div className="p-2.5 text-center" style={{ background: "#232019" }}>
                  <b className="block text-2xl font-black leading-none" style={truck.level === "red" ? { color: LEVEL_COLOR.red } : undefined}>
                    {truck.preparando}
                  </b>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-neutral-400">{t.kitchen.truckPrepLabel}</span>
                </div>
                <div className="p-2.5 text-center" style={{ background: "#232019" }}>
                  <b className="block text-2xl font-black leading-none">{truck.listas}</b>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-neutral-400">{t.kitchen.truckReadyLabel}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-1 flex-col gap-2 text-[13.5px]">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-neutral-400">{t.kitchen.truckOldestLabel}</span>
                  <span className="font-black tabular-nums" style={truck.level ? { color: LEVEL_COLOR[truck.level] } : undefined}>
                    {truck.nuevas + truck.preparando + truck.listas > 0 ? `${truck.oldestMinutes} min` : "—"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-neutral-400">{t.kitchen.truckUnpaidLabel}</span>
                  <span className="font-black" style={truck.porCobrar ? { color: "#F5A524" } : undefined}>
                    {truck.porCobrar ? truck.porCobrar : t.kitchen.truckUnpaidNone}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-neutral-400">{t.kitchen.truckSalesTodayLabel}</span>
                  <span className="font-black">${truck.salesToday.toFixed(2)}</span>
                </div>
              </div>

              {truck.id === ownUnitId && (
                <button
                  onClick={() => onViewTruck(truck.id)}
                  className="mt-4 rounded-lg py-2.5 text-sm font-extrabold"
                  style={{ background: "#F6F3ED", color: "#100F0D" }}
                >
                  {t.kitchen.viewTruckBoard}
                </button>
              )}
            </div>
          ))}
        </div>

        <h3 className="mb-2.5 mt-7 text-[12px] font-black uppercase tracking-wide text-neutral-400">{t.kitchen.attentionNeededTitle}</h3>
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: "#332F29", background: "#1B1917" }}>
          {overview.attention.length === 0 ? (
            <p className="p-5 text-center text-sm font-semibold text-neutral-500">{t.kitchen.attentionNeededEmpty}</p>
          ) : (
            overview.attention.map((a) => (
              <div
                key={a.orderId}
                className="flex flex-wrap items-center gap-3 border-b px-4 py-3 last:border-0"
                style={{ borderColor: "#332F29" }}
              >
                <span className="text-lg font-black tabular-nums">#{a.folio}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {a.summary}
                  {a.customerName && <em className="ml-1 font-medium not-italic text-neutral-400">· {a.customerName}</em>}
                </span>
                <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-bold text-neutral-300" style={{ borderColor: "#332F29" }}>
                  {a.unitName}
                </span>
                <span className="text-base font-black tabular-nums" style={{ color: LEVEL_COLOR[a.level] }}>
                  {a.minutes} min
                </span>
              </div>
            ))
          )}
        </div>

        <p className="mt-4 pb-6 text-xs leading-relaxed text-neutral-500">{t.kitchen.trucksOverviewDisclaimer}</p>
      </div>
    </div>
  )
}
