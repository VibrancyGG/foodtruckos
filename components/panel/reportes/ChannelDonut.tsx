"use client"

import { money } from "@/lib/reportes/format"
import { useChartTooltip, ChartTooltip } from "./ChartTooltip"

export function ChannelDonut({
  breakdown,
  noDataLabel,
  byQrLabel,
  qrLabel,
  ventanillaLabel,
}: {
  breakdown: { qr: number; ventanilla: number } | null
  noDataLabel: string
  byQrLabel: string
  qrLabel: string
  ventanillaLabel: string
}) {
  const { tooltip, show, hide } = useChartTooltip()

  if (!breakdown || breakdown.qr + breakdown.ventanilla === 0) {
    return <p className="text-sm text-neutral-400">{noDataLabel}</p>
  }
  const total = breakdown.qr + breakdown.ventanilla
  const cx = 80, cy = 90, r = 58, sw = 26
  const segments = [
    { key: "qr", label: qrLabel, value: breakdown.qr, color: "#2A78D6" },
    { key: "ventanilla", label: ventanillaLabel, value: breakdown.ventanilla, color: "#EB6834" },
  ]
  let angle = -Math.PI / 2
  const paths = segments.map((s) => {
    if (s.value === 0) return null
    const frac = s.value / total
    const a0 = angle
    const a1 = angle + frac * Math.PI * 2
    angle = a1
    const gap = 0.03
    const p0 = a0 + gap / 2
    const p1 = a1 - gap / 2
    const large = a1 - a0 > Math.PI ? 1 : 0
    // toFixed evita un desajuste de hidratación: Math.cos/sin pueden diferir
    // en el último bit entre el motor del servidor y el del navegador.
    const x0 = (cx + r * Math.cos(p0)).toFixed(4), y0 = (cy + r * Math.sin(p0)).toFixed(4)
    const x1 = (cx + r * Math.cos(p1)).toFixed(4), y1 = (cy + r * Math.sin(p1)).toFixed(4)
    return { ...s, d: `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}` }
  })

  return (
    <div data-chart-wrap className="relative flex items-center gap-6">
      <svg viewBox="0 0 160 180" role="img" aria-label="Ventas por canal" className="h-40 w-40 flex-none">
        {paths.map(
          (p) =>
            p && (
              <path
                key={p.key}
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={sw}
                style={{ cursor: "pointer" }}
                onMouseMove={(e) =>
                  show(
                    e,
                    <>
                      <b>{p.label}</b>
                      <br />
                      <b>{money(p.value)}</b> <span className="text-neutral-400">· {Math.round((p.value / total) * 100)}%</span>
                    </>,
                  )
                }
                onMouseLeave={hide}
              />
            ),
        )}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={20} fontWeight={800} fill="#0B0B0B">
          {Math.round((breakdown.qr / total) * 100)}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fill="#898781">
          {byQrLabel}
        </text>
      </svg>
      <div className="space-y-2 text-sm">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-neutral-600">{s.label}</span>
            <span className="font-bold">{money(s.value)}</span>
          </div>
        ))}
      </div>
      <ChartTooltip tooltip={tooltip} />
    </div>
  )
}
