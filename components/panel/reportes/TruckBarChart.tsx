import { money, pctDelta, fmtDelta } from "@/lib/reportes/format"

type TruckRow = { unitId: string; name: string; currentMonth: number; prevMonth: number | null }

const COLORS = ["#2A78D6", "#EB6834", "#1BAF7A", "#9B59B6", "#B0700A"]

export function TruckBarChart({
  trucks,
  noDataLabel,
  noPrevLabel,
}: {
  trucks: TruckRow[]
  noDataLabel: string
  noPrevLabel: string
}) {
  if (trucks.length === 0) {
    return <p className="text-sm text-neutral-400">{noDataLabel}</p>
  }
  const max = Math.max(...trucks.map((t) => t.currentMonth), 1)

  return (
    <div className="space-y-4">
      {trucks.map((t, i) => {
        const widthPct = (t.currentMonth / max) * 100
        const delta = t.prevMonth !== null ? pctDelta(t.currentMonth, t.prevMonth) : null
        return (
          <div key={t.unitId}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-bold">{t.name}</span>
              <span className="flex items-center gap-2">
                <span className="font-extrabold tabular-nums">{money(t.currentMonth)}</span>
                {delta !== null ? (
                  <span className={delta >= 0 ? "text-green-700" : "text-red-600"}>{fmtDelta(delta)}</span>
                ) : (
                  <span className="text-neutral-400">{noPrevLabel}</span>
                )}
              </span>
            </div>
            <div className="h-5 w-full rounded bg-neutral-100">
              <div
                className="h-5 rounded"
                style={{ width: `${Math.max(widthPct, 2)}%`, background: COLORS[i % COLORS.length] }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
