export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export type DayHours = { open: string; close: string } | null

export type WeeklyHours = Partial<Record<DayKey, DayHours>>

export const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Lun" },
  { key: "tue", label: "Mar" },
  { key: "wed", label: "Mié" },
  { key: "thu", label: "Jue" },
  { key: "fri", label: "Vie" },
  { key: "sat", label: "Sáb" },
  { key: "sun", label: "Dom" },
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
