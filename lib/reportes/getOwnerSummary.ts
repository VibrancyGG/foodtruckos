import { createClient } from "@/lib/supabase/server"
import { toNumber } from "@/lib/supabase/numeric"
import { parseWeeklyHours, dateInTimezone } from "@/lib/units/hours"

// Los nombres de mes se calculan del lado del cliente con Intl según el
// idioma del dueño (useLang) — aquí solo viajan el año y el índice de mes
// (0-11), nunca texto ya formateado en un solo idioma.
function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`
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

  const [{ data: business }, { data: units }, { data: allOrders }] = await Promise.all([
    supabase.from("businesses").select("timezone").eq("id", businessId).single(),
    // Sin filtro de status: un truck archivado se sigue facturando/mostrando
    // en Trucks/Cuenta que no, pero su venta pasada es historia real (Regla
    // 2, nunca se destruye) — si aquí se excluyera, la suma de perTruck ya
    // no cuadraría contra el total del negocio en cuanto algún truck viejo
    // se diera de baja a media temporada.
    supabase.from("units").select("id, name, hours").eq("business_id", businessId),
    supabase
      .from("orders")
      .select("id, unit_id, channel, status, payment_status, total, created_at")
      .eq("business_id", businessId)
      .gte("created_at", windowStart.toISOString())
      .order("created_at"),
  ])

  const timezone = business?.timezone ?? "America/Chicago"
  const unitList = units ?? []
  const allOrderList = (allOrders ?? []).map((o) => ({ ...o, total: toNumber(o.total), created_at: new Date(o.created_at) }))

  // Una venta es efectiva solo cuando se cobró (foodtruckos-negocio Regla 3):
  // el dinero entró de verdad. Toda comparación de "venta" en este reporte —
  // el total, el mes a mes, por truck, por canal, lo más vendido, la
  // actividad — se calcula únicamente sobre pedidos pagados. Un pedido
  // recibido/preparando/listo/entregado sin cobrar no es venta todavía; un
  // pedido cancelado (el cliente nunca llegó) nunca lo fue.
  const orderList = allOrderList.filter((o) => o.payment_status === "pagada")
  const orderIds = orderList.map((o) => o.id)

  // Pendiente de cobro: pedido real que todavía no se cobra — no cuenta como
  // venta, pero el dueño necesita verlo aparte para saber cuánto dinero le
  // falta por entrar. Separado en dos, porque son riesgos distintos: uno
  // sigue en curso (todavía puede cobrarse al entregar), el otro ya salió de
  // cocina sin que nadie cobrara.
  const pendingInProgressOrders = allOrderList.filter(
    (o) => o.status !== "cancelado" && o.status !== "entregado" && o.payment_status !== "pagada",
  )
  const pendingInProgress = {
    total: pendingInProgressOrders.reduce((s, o) => s + o.total, 0),
    count: pendingInProgressOrders.length,
  }
  const pendingDeliveredOrders = allOrderList.filter((o) => o.status === "entregado" && o.payment_status !== "pagada")
  const pendingDelivered = {
    total: pendingDeliveredOrders.reduce((s, o) => s + o.total, 0),
    count: pendingDeliveredOrders.length,
  }

  // No recogidas: el cliente ordenó y nunca llegó por su pedido — cocina lo
  // cancela (app/api/kitchen/route.ts, acción "cancel") y aquí queda como
  // historia, nunca como venta.
  const noShowOrders = allOrderList.filter((o) => o.status === "cancelado")
  const noShow = {
    total: noShowOrders.reduce((s, o) => s + o.total, 0),
    count: noShowOrders.length,
  }

  const { data: items } = orderIds.length
    ? await supabase.from("order_items").select("order_id, product_name_snapshot, quantity").in("order_id", orderIds)
    : { data: [] }

  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const { data: prepEvents } = await supabase
    .from("order_status_events")
    .select("created_at, orders!inner(created_at, business_id)")
    .eq("to_status", "listo")
    .eq("orders.business_id", businessId)
    .gte("created_at", last30Start.toISOString())
    .limit(500)

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
    // Cada orden se agrupa por el día calendario y los minutos del día en la
    // zona horaria REAL del negocio, no en UTC — sin esto, una orden tomada
    // a las 11pm hora local (madrugada en UTC) cae en el día calendario
    // equivocado y compara contra el horario publicado equivocado, lo que
    // puede inflar el "cierra X antes de lo publicado" a un número absurdo.
    const byDay = new Map<string, { dayKey: ReturnType<typeof dateInTimezone>["dayKey"]; minutes: number }[]>()
    for (const o of orderList) {
      if (o.unit_id !== u.id || o.created_at < activityWindowStart) continue
      const local = dateInTimezone(timezone, o.created_at)
      const calendarKey = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(o.created_at)
      const arr = byDay.get(calendarKey) ?? []
      arr.push(local)
      byDay.set(calendarKey, arr)
    }

    const firstMinutes: number[] = []
    const lastMinutes: number[] = []
    const lateDeltas: number[] = []
    const earlyCloseDeltas: number[] = []

    for (const times of byDay.values()) {
      times.sort((a, b) => a.minutes - b.minutes)
      const first = times[0]
      const last = times[times.length - 1]
      firstMinutes.push(first.minutes)
      lastMinutes.push(last.minutes)

      const published = weeklyHours[first.dayKey]
      if (published) {
        const [oh, om] = published.open.split(":").map(Number)
        const [ch, cm] = published.close.split(":").map(Number)
        lateDeltas.push(first.minutes - (oh * 60 + om))
        earlyCloseDeltas.push(ch * 60 + cm - last.minutes)
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

  // ---- insight: hora pico, últimos 30 días, todo el negocio ----
  // Igual disciplina que arriba: nada se muestra si no hay suficientes
  // pedidos reales para que un "pico" signifique algo (mínimo 5).
  let peakHourInsight: { hour: number; count: number } | null = null
  {
    const recentOrders = orderList.filter((o) => o.created_at >= last30Start)
    if (recentOrders.length >= 5) {
      const byHour = new Map<number, number>()
      for (const o of recentOrders) {
        const { minutes } = dateInTimezone(timezone, o.created_at)
        const hour = Math.floor(minutes / 60)
        byHour.set(hour, (byHour.get(hour) ?? 0) + 1)
      }
      const [hour, count] = [...byHour.entries()].sort((a, b) => b[1] - a[1])[0]
      peakHourInsight = { hour, count }
    }
  }

  // ---- insight: día de la semana más fuerte, últimos 30 días ----
  let bestDayInsight: { weekday: number; avgTotal: number } | null = null
  {
    const recentOrders = orderList.filter((o) => o.created_at >= last30Start)
    if (recentOrders.length >= 5) {
      const byWeekday = new Map<number, { total: number; days: Set<string> }>()
      for (const o of recentOrders) {
        const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" }).formatToParts(o.created_at)
        const weekdayName = parts.find((p) => p.type === "weekday")?.value ?? "Sun"
        const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekdayName)
        const calendarKey = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(o.created_at)
        const bucket = byWeekday.get(weekdayIndex) ?? { total: 0, days: new Set<string>() }
        bucket.total += o.total
        bucket.days.add(calendarKey)
        byWeekday.set(weekdayIndex, bucket)
      }
      const averaged = [...byWeekday.entries()].map(([weekday, b]) => ({ weekday, avgTotal: b.total / b.days.size }))
      if (averaged.length > 1) {
        averaged.sort((a, b) => b.avgTotal - a.avgTotal)
        bestDayInsight = { weekday: averaged[0].weekday, avgTotal: Math.round(averaged[0].avgTotal) }
      }
    }
  }

  // ---- insight: tiempo promedio de preparación, últimos 30 días ----
  // Mismo criterio que lib/units/getOwnerUnits.ts: descarta atípicos (>60
  // min, casi siempre un pedido de prueba olvidado) y no muestra nada con
  // menos de 3 muestras reales.
  const MAX_REASONABLE_PREP_MINUTES = 60
  const prepMinutesList = (prepEvents ?? [])
    .map((e) => {
      const order = Array.isArray(e.orders) ? e.orders[0] : e.orders
      if (!order) return null
      const mins = (new Date(e.created_at).getTime() - new Date(order.created_at).getTime()) / 60000
      return mins > 0 && mins <= MAX_REASONABLE_PREP_MINUTES ? mins : null
    })
    .filter((m): m is number => m !== null)
  const avgPrepInsight =
    prepMinutesList.length >= 3
      ? { avgMinutes: Math.round(prepMinutesList.reduce((s, m) => s + m, 0) / prepMinutesList.length), sampleSize: prepMinutesList.length }
      : null

  // ---- insight: platillo estrella del mes ----
  const topProductInsight = topProducts.length > 0 ? topProducts[0] : null

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
    peakHourInsight,
    bestDayInsight,
    avgPrepInsight,
    topProductInsight,
    pendingInProgress,
    pendingDelivered,
    noShow,
  }
}

export type OwnerSummary = Awaited<ReturnType<typeof getOwnerSummary>>
