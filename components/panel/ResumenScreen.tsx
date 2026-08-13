"use client"

import type { OwnerSummary } from "@/lib/reportes/getOwnerSummary"
import { money, pctDelta, fmtDelta, monthName } from "@/lib/reportes/format"
import { useLang } from "@/lib/i18n/LangProvider"
import { formatClock } from "@/lib/units/hours"
import { StatNumber } from "./ui/StatNumber"
import { IconFlame, IconClock, IconCalendarStar, IconTimerBolt } from "./ui/icons"
import { MonthlyLineChart } from "./reportes/MonthlyLineChart"
import { TruckBarChart } from "./reportes/TruckBarChart"
import { ChannelDonut } from "./reportes/ChannelDonut"
import { TopProductsChart } from "./reportes/TopProductsChart"
import { ActivityRow } from "./reportes/ActivityRow"
import { OrdersLedger } from "./reportes/OrdersLedger"

const WEEKDAY_LABEL: Record<"es" | "en", string[]> = {
  es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
}

// Cada tipo de punto clave tiene su propio ícono y color — así se distingue
// de un vistazo sin tener que leer la frase completa, y refuerza que cada
// dato viene de una fuente distinta (ventas, horario, ritmo de cocina).
const HIGHLIGHT_STYLE = {
  top: { icon: IconFlame, bg: "#FFF1EC", fg: "#E2431F" },
  peak: { icon: IconClock, bg: "#EFF6FF", fg: "#2563EB" },
  day: { icon: IconCalendarStar, bg: "#F0FDF4", fg: "#15803D" },
  prep: { icon: IconTimerBolt, bg: "#FAF5FF", fg: "#9333EA" },
} as const

function HighlightItem({ kind, children, delay }: { kind: keyof typeof HIGHLIGHT_STYLE; children: React.ReactNode; delay: number }) {
  const { icon: Icon, bg, fg } = HIGHLIGHT_STYLE[kind]
  return (
    <li className="panel-animate-in flex items-start gap-3" style={{ animationDelay: `${delay}ms` }}>
      <span
        className="grid h-9 w-9 flex-none place-items-center rounded-xl"
        style={{ background: bg, color: fg }}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="pt-1.5 text-[13px] leading-relaxed text-panel-ink/85">{children}</span>
    </li>
  )
}

function Delta({ current, previous, label, noDataLabel }: { current: number; previous: number | null; label: string; noDataLabel: string }) {
  const delta = previous !== null ? pctDelta(current, previous) : null
  return (
    <div>
      <div
        className={`flex items-center gap-1 font-[family-name:var(--font-panel-display)] text-lg font-bold ${
          delta === null ? "text-panel-ink/25" : delta >= 0 ? "text-emerald-600" : "text-rose-600"
        }`}
      >
        {delta !== null ? fmtDelta(delta) : "—"}
      </div>
      <div className="text-xs text-panel-ink-soft">{delta !== null ? label : `${label} · ${noDataLabel}`}</div>
    </div>
  )
}

function Card({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <div
      className={`panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_24px_-8px_rgba(23,20,15,0.12)] ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-wider text-panel-ink-soft">{children}</div>
}

export function ResumenScreen({ data }: { data: OwnerSummary }) {
  const { lang, t } = useLang()
  const p = t.panel.resumenPage
  const monthLabel = monthName(data.currentYear, data.currentMonth, lang)
  const lastMonthLabel = monthName(data.currentYear, data.currentMonth, lang, true)

  return (
    <div className="space-y-4">
      <div data-tour="onboarding-resumen-title" className="panel-animate-in">
        <h1 className="mb-1 font-[family-name:var(--font-panel-display)] text-[26px] font-bold tracking-tight">{p.title}</h1>
        <p className="mb-2 text-sm text-panel-ink-soft">{p.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div
          className="panel-animate-in relative overflow-hidden rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)] md:col-span-2"
          style={{ animationDelay: "40ms" }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle, var(--panel-brand), transparent 70%)" }}
          />
          <Eyebrow>{p.salesOf(monthLabel)}</Eyebrow>
          <div className="mt-1 font-[family-name:var(--font-panel-display)] text-5xl font-bold tracking-tight tabular-nums">
            <StatNumber value={data.current.total} format={money} />
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            <Delta current={data.current.total} previous={data.prev?.total ?? null} label={p.vsLastMonth} noDataLabel={p.noData} />
            <Delta
              current={data.current.total}
              previous={data.sameLastYear?.total ?? null}
              label={p.vsSameMonthLastYear(lastMonthLabel)}
              noDataLabel={p.noData}
            />
            <div>
              <div className="font-[family-name:var(--font-panel-display)] text-lg font-bold tabular-nums">{money(data.avgPerDay)}</div>
              <div className="text-xs text-panel-ink-soft">{p.avgPerDay}</div>
            </div>
          </div>
        </div>

        <Card delay={80}>
          <Eyebrow>{p.yearAccrued}</Eyebrow>
          <div className="mt-1 font-[family-name:var(--font-panel-display)] text-3xl font-bold tracking-tight tabular-nums">
            <StatNumber value={data.yearToDate.total} format={money} />
          </div>
          <div className="mt-3 flex items-baseline justify-between text-sm">
            <span className="text-panel-ink-soft">{p.samePeriod(data.yearToDate.year - 1)}</span>
            <span className="font-semibold">{data.yearToDatePrev ? money(data.yearToDatePrev.total) : p.noData}</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between text-sm">
            <span className="text-panel-ink-soft">{p.yearDelta}</span>
            {(() => {
              const yearDelta = data.yearToDatePrev ? pctDelta(data.yearToDate.total, data.yearToDatePrev.total) : null
              return yearDelta !== null ? (
                <span className={`font-semibold ${yearDelta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{fmtDelta(yearDelta)}</span>
              ) : (
                <span className="font-semibold text-panel-ink/25">{p.noData}</span>
              )
            })()}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card delay={120} className="!border-amber-200 !bg-amber-50/60">
          <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">{p.pendingCollectionTitle}</div>
          <div className="space-y-2.5">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-amber-900">{p.pendingInProgressLabel}</span>
                <span className="font-[family-name:var(--font-panel-display)] text-lg font-bold tabular-nums text-amber-900">
                  {money(data.pendingInProgress.total)}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-amber-700">
                {data.pendingInProgress.count > 0 ? `${data.pendingInProgress.count} · ${p.pendingInProgressHint}` : p.pendingInProgressHint}
              </p>
            </div>
            <div className="border-t border-amber-200/70 pt-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-amber-900">{p.pendingDeliveredLabel}</span>
                <span className="font-[family-name:var(--font-panel-display)] text-lg font-bold tabular-nums text-amber-900">
                  {money(data.pendingDelivered.total)}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-amber-700">
                {data.pendingDelivered.count > 0 ? `${data.pendingDelivered.count} · ${p.pendingDeliveredHint}` : p.pendingDeliveredHint}
              </p>
            </div>
          </div>
        </Card>

        <Card delay={160}>
          <div className="flex items-baseline justify-between">
            <Eyebrow>{p.noShowLabel}</Eyebrow>
            <span className="font-[family-name:var(--font-panel-display)] text-2xl font-bold tabular-nums text-panel-ink">
              {data.noShow.count > 0 ? data.noShow.count : p.noneLabel}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-panel-ink-soft">{p.noShowHint}</p>
        </Card>
      </div>

      {(() => {
        const highlights: React.ReactNode[] = []
        let i = 0
        if (data.topProductInsight) {
          highlights.push(
            <HighlightItem key="top" kind="top" delay={240 + 60 * i++}>
              {p.topProductHighlight(data.topProductInsight.name, data.topProductInsight.quantity)}
            </HighlightItem>,
          )
        }
        if (data.peakHourInsight) {
          const h = data.peakHourInsight.hour
          const range = `${formatClock(`${String(h).padStart(2, "0")}:00`)} – ${formatClock(`${String((h + 1) % 24).padStart(2, "0")}:00`)}`
          highlights.push(
            <HighlightItem key="peak" kind="peak" delay={240 + 60 * i++}>
              {p.peakHourHighlight(range, data.peakHourInsight.count)}
            </HighlightItem>,
          )
        }
        if (data.bestDayInsight) {
          const dayName = WEEKDAY_LABEL[lang][data.bestDayInsight.weekday]
          highlights.push(
            <HighlightItem key="day" kind="day" delay={240 + 60 * i++}>
              {p.bestDayHighlight(dayName, money(data.bestDayInsight.avgTotal))}
            </HighlightItem>,
          )
        }
        if (data.avgPrepInsight) {
          highlights.push(
            <HighlightItem key="prep" kind="prep" delay={240 + 60 * i++}>
              {p.avgPrepHighlight(data.avgPrepInsight.avgMinutes)}
            </HighlightItem>,
          )
        }
        return (
          <Card delay={200} className="!border-panel-brand/15 !bg-panel-brand-soft/40">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-panel-brand-deep">
              {p.highlightsTitle}
            </div>
            <p className="mb-4 text-xs text-panel-ink-soft">{p.highlightsHint}</p>
            {highlights.length > 0 ? <ul className="space-y-3.5">{highlights}</ul> : <p className="text-xs text-panel-ink/40">{p.noHighlightsYet}</p>}
          </Card>
        )
      })()}

      <Card delay={240}>
        <Eyebrow>{p.monthlySales}</Eyebrow>
        <p className="mb-3 mt-0.5 text-xs text-panel-ink-soft">{p.vsLabel(data.currentYear, data.currentYear - 1)}</p>
        <MonthlyLineChart series={data.monthlySeries} currentYear={data.currentYear} lang={lang} noDataLabel={p.noSalesToGraph} />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card delay={280}>
          <div className="mb-3">
            <Eyebrow>{p.eachTruckIn(monthLabel.toLowerCase())}</Eyebrow>
          </div>
          <TruckBarChart trucks={data.perTruck} noDataLabel={p.noActiveTrucks} noPrevLabel={p.noPreviousMonth} />
        </Card>

        <Card delay={300}>
          <div className="mb-3">
            <Eyebrow>{p.whereFrom}</Eyebrow>
          </div>
          <ChannelDonut
            breakdown={data.channelBreakdown}
            noDataLabel={p.noSalesThisMonth}
            byQrLabel={p.byQrLabel}
            qrLabel={p.qrChannel}
            ventanillaLabel={p.ventanillaChannel}
          />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card delay={320}>
          <div className="mb-3">
            <Eyebrow>{p.topSelling}</Eyebrow>
          </div>
          <TopProductsChart products={data.topProducts} noDataLabel={p.noOrdersThisMonth} piecesLabel={p.piecesThisMonth} />
        </Card>

        <Card delay={340}>
          <Eyebrow>{p.salesActivity}</Eyebrow>
          <p className="mb-3 mt-0.5 text-xs text-panel-ink-soft">{p.salesActivityHint}</p>
          <div className="space-y-4">
            {data.activity.map((a) => (
              <ActivityRow key={a.unitId} activity={a} t={p} />
            ))}
          </div>
          {data.lateOpenInsight && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
              <div className="mb-1 text-sm font-bold text-amber-900">
                {p.lateOpenInsightTitle(data.lateOpenInsight.unitName, data.lateOpenInsight.lateMinutes)}
              </div>
              <p className="text-xs leading-relaxed text-amber-800">
                {p.lateOpenInsightBody(money(data.lateOpenInsight.estimatedMonthlyLoss))}
              </p>
            </div>
          )}
          <p className="mt-3 text-[11px] leading-relaxed text-panel-ink/40">{p.salesActivityDisclaimer}</p>
        </Card>
      </div>

      <Card delay={380}>
        <OrdersLedger
          orders={data.ledger}
          trucks={data.perTruck.map((u) => ({ unitId: u.unitId, name: u.name }))}
          t={t}
          lang={lang}
        />
      </Card>
    </div>
  )
}
