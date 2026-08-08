import { createClient } from "@/lib/supabase/server"
import { toNumber } from "@/lib/supabase/numeric"
import { dayKeyFor, parseWeeklyHours } from "@/lib/units/hours"

// Los nombres de mes se calculan del lado del cliente con Intl según el
// idioma del dueño (useLang) — aquí solo viajan el año y el índice de mes
// (0-11), nunca texto ya formateado en un solo idioma.
function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`
}

function minutesOfDay(d: Date) {
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}

function fmtMinutes(m: number) {
  const h = Math.floor(m / 60) % 24
  const mm = Math.round(m % 60)
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}

// Nunca se inventa una comparación: si el periodo anterior no tiene ni una
// orden real, la delta es null y la pantalla debe decir "aún sin datos",
// no mostrar un 0% o un porcentaje calculado contra la nada.
export async function getOwnerSummary(businessId: string) {
  const supabase = await createClient()
  const now = new Date()
  const currentYear = now.getUTCFullYear()
  const currentMonth = now.getUTCMonth() // 0-11

  const windowStart = new Date(Date.UTC(currentYear - 1, 0, 1))

  const [{ data: units }, { data: orders }] = await Promise.all([
    supabase
      .from("units")
      .select("id, name, hours")
      .eq("business_id", businessId)
      .neq("status", "archived"),
    supabase
      .from("orders")
      .select("id, unit_id, channel, status, total, created_at")
      .eq("business_id", businessId)
      .neq("status", "cancelado")
      .gte("created_at", windowStart.toISOString())
      .order("created_at"),
  ])

  const unitList = units ?? []
  const orderList = (orders ?? []).map((o) => ({ ...o, total: toNumber(o.total), created_at: new Date(o.created_at) }))
  const orderIds = orderList.map((o) => o.id)

  const { data: items } = orderIds.length
    ? await supabase.from("order_items").select("order_id, product_name_snapshot, quantity").in("order_id", orderIds)
    : { data: [] }

  // ---- ventas por mes (para hero, año acumulado y la línea 12 meses) ----
  const byMonth = new Map<string, { total: number; count: number }>()
  for (const o of orderList) {
    const key = monthKey(o.created_at)
    const bucket = byMonth.get(key) ?? { total: 0, count: 0 }
    bucket.total += o.total
    bucket.count += 1
    byMonth.set(key, bucket)
  }
  const monthBucket = (y: number, m: number) => byMonth.get(`${y}-${m}`) ?? null

  const current = monthBucket(currentYear, currentMonth)
  const prevMonthDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1))
  const prev = monthBucket(prevMonthDate.getUTCFullYear(), prevMonthDate.getUTCMonth())
  const sameLastYear = monthBucket(currentYear - 1, currentMonth)

  const daysSoFar = now.getUTCDate()
  const avgPerDay = current ? current.total / daysSoFar : 0

  let ytdCurrent = 0
  let ytdPrevCount = 0
  let ytdPrev = 0
  let ytdCurrentCount = 0
  for (let m = 0; m <= currentMonth; m++) {
    const c = monthBucket(currentYear, m)
    if (c) {
      ytdCurrent += c.total
      ytdCurrentCount += c.count
    }
    const p = monthBucket(currentYear - 1, m)
    if (p) {
      ytdPrev += p.total
      ytdPrevCount += p.count
    }
  }

  const monthlySeries = Array.from({ length: 12 }, (_, m) => ({
    month: m,
    currentYear: monthBucket(currentYear, m)?.total ?? null,
    prevYear: monthBucket(currentYear - 1, m)?.total ?? null,
  }))

  // ---- por truck, mes actual contra mes anterior ----
  const perTruck = unitList.map((u) => {
    const curr = orderList
      .filter((o) => o.unit_id === u.id && monthKey(o.created_at) === `${currentYear}-${currentMonth}`)
      .reduce((s, o) => s + o.total, 0)
    const prevTotal = orderList
      .filter((o) => o.unit_id === u.id && monthKey(o.created_at) === `${prevMonthDate.getUTCFullYear()}-${prevMonthDate.getUTCMonth()}`)
      .reduce((s, o) => s + o.total, 0)
    const hasPrev = orderList.some(
      (o) => o.unit_id === u.id && monthKey(o.created_at) === `${prevMonthDate.getUTCFullYear()}-${prevMonthDate.getUTCMonth()}`,
    )
    return { unitId: u.id, name: u.name, currentMonth: curr, prevMonth: hasPrev ? prevTotal : null }
  })

  // ---- canal (QR vs ventanilla), mes actual ----
  const currentMonthOrders = orderList.filter((o) => monthKey(o.created_at) === `${currentYear}-${currentMonth}`)
  const channelBreakdown =
    currentMonthOrders.length === 0
      ? null
      : {
          qr: currentMonthOrders.filter((o) => o.channel === "qr").reduce((s, o) => s + o.total, 0),
          ventanilla: currentMonthOrders.filter((o) => o.channel === "ventanilla").reduce((s, o) => s + o.total, 0),
        }

  // ---- productos más vendidos, mes actual ----
  const currentMonthOrderIds = new Set(currentMonthOrders.map((o) => o.id))
  const productTotals = new Map<string, number>()
  for (const it of items ?? []) {
    if (!currentMonthOrderIds.has(it.order_id)) continue
    productTotals.set(it.product_name_snapshot, (productTotals.get(it.product_name_snapshot) ?? 0) + it.quantity)
  }
  const topProducts = [...productTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, quantity]) => ({ name, quantity }))

  // ---- actividad de venta: últimos 30 días, por truck ----
  const activityWindowStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const activity = unitList.map((u) => {
    const weeklyHours = parseWeeklyHours(u.hours)
    const byDay = new Map<string, Date[]>()
    for (const o of orderList) {
      if (o.unit_id !== u.id || o.created_at < activityWindowStart) continue
      const dayKey = o.created_at.toISOString().slice(0, 10)
      const arr = byDay.get(dayKey) ?? []
      arr.push(o.created_at)
      byDay.set(dayKey, arr)
    }

    const firstMinutes: number[] = []
    const lastMinutes: number[] = []
    const lateDeltas: number[] = []
    const earlyCloseDeltas: number[] = []

    for (const [dayKey, times] of byDay) {
      times.sort((a, b) => a.getTime() - b.getTime())
      const first = times[0]
      const last = times[times.length - 1]
      firstMinutes.push(minutesOfDay(first))
      lastMinutes.push(minutesOfDay(last))

      const published = weeklyHours[dayKeyFor(new Date(dayKey + "T00:00:00Z"))]
      if (published) {
        const [oh, om] = published.open.split(":").map(Number)
        const [ch, cm] = published.close.split(":").map(Number)
        lateDeltas.push(minutesOfDay(first) - (oh * 60 + om))
        earlyCloseDeltas.push(ch * 60 + cm - minutesOfDay(last))
      }
    }

    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null)
    const firstAvg = avg(firstMinutes)
    const lastAvg = avg(lastMinutes)
    const lateAvg = avg(lateDeltas)
    const earlyAvg = avg(earlyCloseDeltas)

    return {
      unitId: u.id,
      unitName: u.name,
      daysWithSales: byDay.size,
      firstOrderAvg: firstAvg !== null ? fmtMinutes(firstAvg) : null,
      lastOrderAvg: lastAvg !== null ? fmtMinutes(lastAvg) : null,
      hasPublishedHours: Object.values(weeklyHours).some((v) => v),
      lateMinutes: lateAvg,
      earlyCloseMinutes: earlyAvg,
    }
  })

  // ---- insight: costo estimado de abrir tarde ----
  // Nunca se inventa un número: la estimación sale de la venta real del mes
  // dividida entre las horas reales publicadas, nunca de un promedio de
  // industria ni de una cifra fija. Si falta cualquier dato real (horario,
  // venta del mes, o el retraso no llega al umbral), no se muestra nada.
  const LATE_THRESHOLD_MINUTES = 20
  let lateOpenInsight: { unitName: string; lateMinutes: number; estimatedMonthlyLoss: number } | null = null
  for (const a of activity) {
    if (a.lateMinutes === null || a.lateMinutes < LATE_THRESHOLD_MINUTES || !a.hasPublishedHours) continue
    const truckMonth = perTruck.find((t) => t.unitId === a.unitId)
    if (!truckMonth || truckMonth.currentMonth <= 0) continue

    const weeklyHours = parseWeeklyHours(unitList.find((u) => u.id === a.unitId)?.hours)
    const openDays = Object.values(weeklyHours).filter((d): d is { open: string; close: string } => !!d)
    if (openDays.length === 0) continue
    const avgOpenMinutesPerDay =
      openDays.reduce((sum, d) => {
        const [oh, om] = d.open.split(":").map(Number)
        const [ch, cm] = d.close.split(":").map(Number)
        return sum + (ch * 60 + cm - (oh * 60 + om))
      }, 0) / openDays.length
    if (avgOpenMinutesPerDay <= 0) continue

    const dailyRate = truckMonth.currentMonth / daysSoFar
    const hourlyRate = dailyRate / (avgOpenMinutesPerDay / 60)
    const estimatedMonthlyLoss = hourlyRate * (a.lateMinutes / 60) * 30

    if (!lateOpenInsight || a.lateMinutes > lateOpenInsight.lateMinutes) {
      lateOpenInsight = { unitName: a.unitName, lateMinutes: Math.round(a.lateMinutes), estimatedMonthlyLoss: Math.round(estimatedMonthlyLoss) }
    }
  }

  return {
    currentMonth,
    currentYear,
    daysSoFar,
    current: current ? { total: current.total, count: current.count } : { total: 0, count: 0 },
    prev: prev ? { total: prev.total } : null,
    sameLastYear: sameLastYear ? { total: sameLastYear.total } : null,
    avgPerDay,
    yearToDate: { total: ytdCurrent, count: ytdCurrentCount, year: currentYear },
    yearToDatePrev: ytdPrevCount > 0 ? { total: ytdPrev, year: currentYear - 1 } : null,
    monthlySeries,
    perTruck,
    channelBreakdown,
    topProducts,
    activity,
    lateOpenInsight,
  }
}

export type OwnerSummary = Awaited<ReturnType<typeof getOwnerSummary>>
