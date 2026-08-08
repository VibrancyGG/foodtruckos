import type { OwnerSummary } from "@/lib/reportes/getOwnerSummary"
import { money, pctDelta, fmtDelta } from "@/lib/reportes/format"
import { MonthlyLineChart } from "./reportes/MonthlyLineChart"
import { TruckBarChart } from "./reportes/TruckBarChart"
import { ChannelDonut } from "./reportes/ChannelDonut"
import { TopProductsChart } from "./reportes/TopProductsChart"
import { ActivityRow } from "./reportes/ActivityRow"

function Delta({ current, previous, label }: { current: number; previous: number | null; label: string }) {
  const delta = previous !== null ? pctDelta(current, previous) : null
  return (
    <div>
      <div className={`flex items-center gap-1 text-lg font-extrabold ${delta === null ? "text-neutral-300" : delta >= 0 ? "text-green-700" : "text-red-600"}`}>
        {delta !== null ? fmtDelta(delta) : "—"}
      </div>
      <div className="text-xs text-neutral-500">{delta !== null ? label : `${label} · aún sin datos`}</div>
    </div>
  )
}

export function ResumenScreen({ data, currentYear }: { data: OwnerSummary; currentYear: number }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:col-span-2">
          <div className="text-xs font-bold uppercase tracking-wide text-neutral-500">Venta de {data.label}</div>
          <div className="mt-1 text-5xl font-black tracking-tight">{money(data.current.total)}</div>
          <div className="mt-4 flex flex-wrap gap-6">
            <Delta current={data.current.total} previous={data.prev?.total ?? null} label="contra el mes anterior" />
            <Delta
              current={data.current.total}
              previous={data.sameLastYear?.total ?? null}
              label={`contra ${data.label.split(" ")[0]} del año pasado`}
            />
            <div>
              <div className="text-lg font-extrabold">{money(data.avgPerDay)}</div>
              <div className="text-xs text-neutral-500">promedio por día</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-neutral-500">Año acumulado</div>
          <div className="mt-1 text-3xl font-black tracking-tight">{money(data.yearToDate.total)}</div>
          <div className="mt-3 flex items-baseline justify-between text-sm">
            <span className="text-neutral-500">Mismo periodo {data.yearToDate.year - 1}</span>
            <span className="font-bold">
              {data.yearToDatePrev ? money(data.yearToDatePrev.total) : "sin datos"}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-500">Venta mes a mes</div>
        <p className="mb-3 text-xs text-neutral-400">
          {currentYear} contra {currentYear - 1}
        </p>
        <MonthlyLineChart series={data.monthlySeries} currentYear={currentYear} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">
            Cada truck en {data.label.split(" ")[0].toLowerCase()}
          </div>
          <TruckBarChart trucks={data.perTruck} />
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">De dónde llegan</div>
          <ChannelDonut breakdown={data.channelBreakdown} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">Lo que más se vende</div>
          <TopProductsChart products={data.topProducts} />
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-500">Actividad de venta</div>
          <p className="mb-3 text-xs text-neutral-400">Cuándo entra la primera y la última orden de cada truck</p>
          <div className="space-y-4">
            {data.activity.map((a) => (
              <ActivityRow key={a.unitId} activity={a} />
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
            Esto mide cuándo empieza y termina la venta de cada truck. No registra entradas ni salidas de personal,
            y no sirve para calcular pagos.
          </p>
        </div>
      </div>
    </div>
  )
}
