import { money } from "@/lib/reportes/format"

type Point = { month: number; label: string; currentYear: number | null; prevYear: number | null }

export function MonthlyLineChart({ series, currentYear }: { series: Point[]; currentYear: number }) {
  const W = 760, H = 220, L = 52, R = 12, T = 14, B = 28
  const w = W - L - R, h = H - T - B
  const values = series.flatMap((p) => [p.currentYear, p.prevYear]).filter((v): v is number => v !== null)
  const max = values.length ? Math.max(...values) * 1.15 : 100
  const y = (v: number) => T + h - (v / max) * h
  const x = (i: number) => L + (i / 11) * w

  const gridValues = [0, max / 3, (max * 2) / 3, max]
  const curPath = series
    .map((p, i) => (p.currentYear !== null ? `${x(i)},${y(p.currentYear)}` : null))
    .filter((s): s is string => s !== null)
  const prevPath = series
    .map((p, i) => (p.prevYear !== null ? `${x(i)},${y(p.prevYear)}` : null))
    .filter((s): s is string => s !== null)

  if (values.length === 0) {
    return <p className="text-sm text-neutral-400">Todavía no hay ventas registradas para graficar.</p>
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Venta mensual" className="w-full">
      {gridValues.map((v, i) => (
        <g key={i}>
          <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} stroke="#E1E0D9" strokeWidth={1} />
          <text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize={10} fill="#898781">
            {v === 0 ? "0" : v >= 1000 ? `$${Math.round(v / 1000)}k` : money(v)}
          </text>
        </g>
      ))}
      {series.map((p, i) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="#898781">
          {p.label}
        </text>
      ))}
      {prevPath.length > 1 && (
        <polyline fill="none" stroke="#B9B7AF" strokeWidth={2} strokeDasharray="5 4" points={prevPath.join(" ")} />
      )}
      {curPath.length > 1 && (
        <polyline fill="none" stroke="#2A78D6" strokeWidth={2.5} strokeLinecap="round" points={curPath.join(" ")} />
      )}
      {series.map((p, i) =>
        p.currentYear !== null ? (
          <circle key={i} cx={x(i)} cy={y(p.currentYear)} r={3.5} fill="#2A78D6" stroke="#fff" strokeWidth={1.5} />
        ) : null,
      )}
      {series.map((p, i) =>
        p.currentYear !== null ? (
          <text key={`v${i}`} x={x(i)} y={y(p.currentYear) - 10} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0B0B0B">
            {i === series.findLastIndex((s) => s.currentYear !== null) ? money(p.currentYear) : ""}
          </text>
        ) : null,
      )}
      <g transform={`translate(${L}, ${T - 4})`}>
        <rect width={10} height={10} rx={2} fill="#2A78D6" />
        <text x={14} y={9} fontSize={10} fontWeight={600} fill="#52514E">
          {currentYear}
        </text>
        <line x1={70} y1={5} x2={84} y2={5} stroke="#B9B7AF" strokeWidth={2} strokeDasharray="4 3" />
        <text x={88} y={9} fontSize={10} fontWeight={600} fill="#52514E">
          {currentYear - 1}
        </text>
      </g>
    </svg>
  )
}
