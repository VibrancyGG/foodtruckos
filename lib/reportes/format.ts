export function money(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US")
}

export function monthName(year: number, month: number, lang: "es" | "en", short = false) {
  const locale = lang === "es" ? "es-MX" : "en-US"
  // timeZone: "UTC" es obligatorio aquí — sin esto, Intl interpreta la fecha
  // en la zona horaria local del navegador/servidor y un 1 de enero a
  // medianoche UTC se corre a "31 de diciembre" en cualquier huso detrás de UTC.
  const name = new Intl.DateTimeFormat(locale, { month: short ? "short" : "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1)))
  return short ? name.replace(".", "") : name.charAt(0).toUpperCase() + name.slice(1)
}

export function pctDelta(current: number, previous: number) {
  if (previous === 0) return null
  return ((current / previous - 1) * 100)
}

export function fmtDelta(p: number) {
  const arrow = p >= 0 ? "↑" : "↓"
  return `${arrow} ${p >= 0 ? "+" : "−"}${Math.abs(p).toFixed(1)}%`
}
