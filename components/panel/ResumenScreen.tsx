"use client"

import type { OwnerSummary } from "@/lib/reportes/getOwnerSummary"
import { money, pctDelta, fmtDelta, monthName } from "@/lib/reportes/format"
import { useLang } from "@/lib/i18n/LangProvider"
import { MonthlyLineChart } from "./reportes/MonthlyLineChart"
import { TruckBarChart } from "./reportes/TruckBarChart"
import { ChannelDonut } from "./reportes/ChannelDonut"
import { TopProductsChart } from "./reportes/TopProductsChart"
import { ActivityRow } from "./reportes/ActivityRow"

function Delta({ current, previous, label, noDataLabel }: { current: number; previous: number | null; label: string; noDataLabel: string }) {
  const delta = previous !== null ? pctDelta(current, previous) : null
  return (
    <div>
      <div className={`flex items-center gap-1 text-lg font-extrabold ${delta === null ? "text-neutral-300" : delta >= 0 ? "text-green-700" : "text-red-600"}`}>
        {delta !== null ? fmtDelta(delta) : "—"}
      </div>
      <div className="text-xs text-neutral-500">{delta !== null ? label : `${label} · ${noDataLabel}`}</div>
    </div>
  )
}

export function ResumenScreen({ data }: { data: OwnerSummary }) {
  const { lang, t } = useLang()
  const p = t.panel.resumenPage
  const monthLabel = monthName(data.currentYear, data.currentMonth, lang)
  const lastMonthLabel = monthName(data.currentYear, data.currentMonth, lang, true)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="mb-1 text-2xl font-black">{p.title}</h1>
        <p className="mb-2 text-sm text-neutral-500">{p.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:col-span-2">
          <div className="text-xs font-bold uppercase tracking-wide text-neutral-500">{p.salesOf(monthLabel)}</div>
          <div className="mt-1 text-5xl font-black tracking-tight">{money(data.current.total)}</div>
          <div className="mt-4 flex flex-wrap gap-6">
            <Delta current={data.current.total} previous={data.prev?.total ?? null} label={p.vsLastMonth} noDataLabel={p.noData} />
            <Delta
              current={data.current.total}
              previous={data.sameLastYear?.total ?? null}
              label={p.vsSameMonthLastYear(lastMonthLabel)}
              noDataLabel={p.noData}
            />
            <div>
              <div className="text-lg font-extrabold">{money(data.avgPerDay)}</div>
              <div className="text-xs text-neutral-500">{p.avgPerDay}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-neutral-500">{p.yearAccrued}</div>
          <div className="mt-1 text-3xl font-black tracking-tight">{money(data.yearToDate.total)}</div>
          <div className="mt-3 flex items-baseline justify-between text-sm">
            <span className="text-neutral-500">{p.samePeriod(data.yearToDate.year - 1)}</span>
            <span className="font-bold">
              {data.yearToDatePrev ? money(data.yearToDatePrev.total) : p.noData}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between text-sm">
            <span className="text-neutral-500">{p.yearDelta}</span>
            {(() => {
              const yearDelta = data.yearToDatePrev ? pctDelta(data.yearToDate.total, data.yearToDatePrev.total) : null
              return yearDelta !== null ? (
                <span className={`font-bold ${yearDelta >= 0 ? "text-green-700" : "text-red-600"}`}>{fmtDelta(yearDelta)}</span>
              ) : (
                <span className="font-bold text-neutral-300">{p.noData}</span>
              )
            })()}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-2.5 text-xs font-bold uppercase tracking-wide text-amber-800">{p.pendingCollectionTitle}</div>
          <div className="space-y-2.5">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-amber-900">{p.pendingInProgressLabel}</span>
                <span className="text-lg font-black tracking-tight text-amber-900">{money(data.pendingInProgress.total)}</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-700">
                {data.pendingInProgress.count > 0 ? `${data.pendingInProgress.count} · ${p.pendingInProgressHint}` : p.pendingInProgressHint}
              </p>
            </div>
            <div className="border-t border-amber-200 pt-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-amber-900">{p.pendingDeliveredLabel}</span>
                <span className="text-lg font-black tracking-tight text-amber-900">{money(data.pendingDelivered.total)}</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-700">
                {data.pendingDelivered.count > 0 ? `${data.pendingDelivered.count} · ${p.pendingDeliveredHint}` : p.pendingDeliveredHint}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">{p.noShowLabel}</span>
            <span className="text-2xl font-black tracking-tight text-neutral-700">
              {data.noShow.count > 0 ? data.noShow.count : p.noneLabel}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">{p.noShowHint}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-500">{p.monthlySales}</div>
        <p className="mb-3 text-xs text-neutral-400">{p.vsLabel(data.currentYear, data.currentYear - 1)}</p>
        <MonthlyLineChart series={data.monthlySeries} currentYear={data.currentYear} lang={lang} noDataLabel={p.noSalesToGraph} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">{p.eachTruckIn(monthLabel.toLowerCase())}</div>
          <TruckBarChart trucks={data.perTruck} noDataLabel={p.noActiveTrucks} noPrevLabel={p.noPreviousMonth} />
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">{p.whereFrom}</div>
          <ChannelDonut
            breakdown={data.channelBreakdown}
            noDataLabel={p.noSalesThisMonth}
            byQrLabel={p.byQrLabel}
            qrLabel={p.qrChannel}
            ventanillaLabel={p.ventanillaChannel}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">{p.topSelling}</div>
          <TopProductsChart products={data.topProducts} noDataLabel={p.noOrdersThisMonth} piecesLabel={p.piecesThisMonth} />
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-500">{p.salesActivity}</div>
          <p className="mb-3 text-xs text-neutral-400">{p.salesActivityHint}</p>
          <div className="space-y-4">
            {data.activity.map((a) => (
              <ActivityRow key={a.unitId} activity={a} t={p} />
            ))}
          </div>
          {data.lateOpenInsight && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3.5">
              <div className="mb-1 text-sm font-extrabold text-amber-900">
                {p.lateOpenInsightTitle(data.lateOpenInsight.unitName, data.lateOpenInsight.lateMinutes)}
              </div>
              <p className="text-xs leading-relaxed text-amber-800">
                {p.lateOpenInsightBody(money(data.lateOpenInsight.estimatedMonthlyLoss))}
              </p>
            </div>
          )}
          <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">{p.salesActivityDisclaimer}</p>
        </div>
      </div>
    </div>
  )
}
