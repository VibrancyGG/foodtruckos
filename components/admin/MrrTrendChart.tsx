"use client"

import { useChartTooltip, ChartTooltip } from "@/components/panel/reportes/ChartTooltip"

const MONTH_KEYS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
const MONTH_KEYS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function MrrTrendChart({ history, lang }: { history: { monthsAgo: number; total: number }[]; lang: "es" | "en" }) {
  const now = new Date()
  const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`
  const months = lang === "es" ? MONTH_KEYS_ES : MONTH_KEYS_EN
  const labels = history.map((h) => {
    const d = new Date(now.getFullYear(), now.getMonth() - h.monthsAgo, 1)
    return months[d.getMonth()]
  })

  const W = 420, H = 130, L = 6, R = 6, T = 10, B = 22
  const w = W - L - R, h = H - T - B
  const max = Math.max(...history.map((p) => p.total), 1) * 1.12
  const x = (i: number) => L + (i / (history.length - 1)) * w
  const y = (v: number) => T + h - (v / max) * h
  const points = history.map((p, i) => `${x(i)},${y(p.total)}`).join(" ")
  const last = history.length - 1

  const { tooltip, show, hide } = useChartTooltip()

  return (
    <div data-chart-wrap className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={L} y1={T + h} x2={W - R} y2={T + h} stroke="#3f3f46" strokeWidth={1} />
        {labels.map((m, i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#71717a">
            {m}
          </text>
        ))}
        <polyline fill="none" stroke="#2A78D6" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" points={points} />
        {history.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.total)} r={3.5} fill="#2A78D6" stroke="#171717" strokeWidth={1.5} />
        ))}
        <text x={x(last)} y={y(history[last].total) - 10} textAnchor="end" fontSize={10.5} fontWeight={800} fill="#fafafa">
          {money(history[last].total)}
        </text>
        {history.map((p, i) => (
          <rect
            key={`hit${i}`}
            x={x(i) - w / (history.length * 2)}
            y={T}
            width={w / history.length}
            height={h}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onMouseMove={(e) =>
              show(
                e,
                <>
                  <b>{labels[i]}</b>
                  <br />
                  {money(p.total)}
                </>,
              )
            }
            onMouseLeave={hide}
          />
        ))}
      </svg>
      <ChartTooltip tooltip={tooltip} />
    </div>
  )
}
