type Activity = {
  unitId: string
  unitName: string
  daysWithSales: number
  firstOrderAvg: string | null
  lastOrderAvg: string | null
  hasPublishedHours: boolean
  lateMinutes: number | null
  earlyCloseMinutes: number | null
}

const WINDOW_START = 7 * 60 // 07:00
const WINDOW_END = 23 * 60 // 23:00

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

function fmtDuration(minutes: number) {
  const m = Math.round(minutes)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest === 0 ? `${h} h` : `${h} h ${rest} min`
}

function px(minutes: number) {
  return ((minutes - WINDOW_START) / (WINDOW_END - WINDOW_START)) * 100
}

export function ActivityRow({ activity }: { activity: Activity }) {
  if (activity.daysWithSales === 0) {
    return (
      <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-400">
        <span className="font-bold text-neutral-600">{activity.unitName}</span> — sin órdenes en los últimos 30
        días.
      </div>
    )
  }

  const first = toMinutes(activity.firstOrderAvg!)
  const last = toMinutes(activity.lastOrderAvg!)
  const late = activity.lateMinutes !== null && activity.lateMinutes >= 5
  const early = activity.earlyCloseMinutes !== null && activity.earlyCloseMinutes >= 5

  return (
    <div>
      <div className="mb-1 flex items-baseline gap-2">
        <span className="text-sm font-bold">{activity.unitName}</span>
        <span className="text-xs text-neutral-500">
          {activity.daysWithSales} día{activity.daysWithSales === 1 ? "" : "s"} con ventas, últimos 30 días
        </span>
        {activity.hasPublishedHours ? (
          <span
            className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
              late ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
            }`}
          >
            {late ? `abre ${fmtDuration(activity.lateMinutes!)} tarde` : "abre a tiempo"}
          </span>
        ) : (
          <span className="ml-auto rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-bold text-neutral-500">
            sin horario publicado
          </span>
        )}
      </div>
      <svg viewBox="0 0 100 14" preserveAspectRatio="none" className="h-3.5 w-full">
        <rect x={0} y={4} width={100} height={6} rx={2} fill="#E1E0D9" />
        <rect
          x={Math.max(px(first), 0)}
          y={2}
          width={Math.max(px(last) - px(first), 1)}
          height={10}
          rx={2}
          fill="#2A78D6"
        />
      </svg>
      <div className="mt-1 text-xs text-neutral-500">
        primera orden <b className="text-neutral-800">{activity.firstOrderAvg}</b> · última{" "}
        <b className="text-neutral-800">{activity.lastOrderAvg}</b>
        {early && (
          <span className="ml-1">
            · cierra {fmtDuration(activity.earlyCloseMinutes!)} antes de lo publicado
          </span>
        )}
      </div>
    </div>
  )
}
