export function money(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US")
}

export function pctDelta(current: number, previous: number) {
  if (previous === 0) return null
  return ((current / previous - 1) * 100)
}

export function fmtDelta(p: number) {
  const arrow = p >= 0 ? "↑" : "↓"
  return `${arrow} ${p >= 0 ? "+" : "−"}${Math.abs(p).toFixed(1)}%`
}
