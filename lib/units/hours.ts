export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export type DayHours = { open: string; close: string } | null

export type WeeklyHours = Partial<Record<DayKey, DayHours>>

export const DAYS: { key: DayKey; label: string; labelEn: string }[] = [
  { key: "mon", label: "Lun", labelEn: "Mon" },
  { key: "tue", label: "Mar", labelEn: "Tue" },
  { key: "wed", label: "Mié", labelEn: "Wed" },
  { key: "thu", label: "Jue", labelEn: "Thu" },
  { key: "fri", label: "Vie", labelEn: "Fri" },
  { key: "sat", label: "Sáb", labelEn: "Sat" },
  { key: "sun", label: "Dom", labelEn: "Sun" },
]

// getDay() de JS: 0=domingo..6=sábado. Lo mapeamos a nuestras llaves lun..dom.
const JS_DAY_TO_KEY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

export function dayKeyFor(date: Date): DayKey {
  return JS_DAY_TO_KEY[date.getDay()]
}

export function parseWeeklyHours(raw: unknown): WeeklyHours {
  if (!raw || typeof raw !== "object") return {}
  return raw as WeeklyHours
}

function formatClock(t: string): string {
  const [hStr, mStr] = t.split(":")
  const h = Number(hStr)
  const m = Number(mStr)
  const suffix = h >= 12 ? "pm" : "am"
  const h12 = h % 12 || 12
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`
}

// Resume los siete días en una frase corta — "11 am – 9 pm · Todos los
// días" o "Varía por día" cuando los horarios no coinciden entre sí — igual
// que el prototipo, para que el dueño confirme de un vistazo qué va a
// quedar antes de guardar.
export function summarizeHours(hours: WeeklyHours, lang: "es" | "en") {
  const open = DAYS.map((d, i) => ({ ...hours[d.key], i, d })).filter(
    (d): d is { open: string; close: string; i: number; d: (typeof DAYS)[number] } => !!hours[d.d.key],
  )
  if (open.length === 0) return { hours: null, days: null }

  const same = open.every((d) => d.open === open[0].open && d.close === open[0].close)
  const hoursText = same ? `${formatClock(open[0].open)} – ${formatClock(open[0].close)}` : null

  let daysText: string
  if (open.length === 7) {
    daysText = lang === "es" ? "Todos los días" : "Every day"
  } else {
    const idx = open.map((d) => d.i)
    const consecutive = idx.every((v, k) => k === 0 || v === idx[k - 1] + 1)
    if (consecutive && open.length > 2) {
      const first = open[0].d
      const last = open[open.length - 1].d
      const firstLabel = lang === "es" ? first.label : first.labelEn
      const lastLabel = (lang === "es" ? last.label : last.labelEn).toLowerCase()
      daysText = lang === "es" ? `${firstLabel} a ${lastLabel}` : `${firstLabel} to ${lastLabel}`
    } else {
      daysText = open.map((d) => (lang === "es" ? d.d.label : d.d.labelEn)).join(", ")
    }
  }
  return { hours: hoursText, days: daysText }
}
