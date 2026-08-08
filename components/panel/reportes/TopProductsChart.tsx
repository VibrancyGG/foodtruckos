"use client"

import { useChartTooltip, ChartTooltip } from "./ChartTooltip"

export function TopProductsChart({
  products,
  noDataLabel,
  piecesLabel,
}: {
  products: { name: string; quantity: number }[]
  noDataLabel: string
  piecesLabel: string
}) {
  const { tooltip, show, hide } = useChartTooltip()

  if (products.length === 0) {
    return <p className="text-sm text-neutral-400">{noDataLabel}</p>
  }
  const max = products[0].quantity

  return (
    <div data-chart-wrap className="relative space-y-2.5">
      {products.map((p) => (
        <div key={p.name}>
          <div className="mb-0.5 text-xs font-semibold">{p.name}</div>
          <div
            className="flex cursor-pointer items-center gap-2"
            onMouseMove={(e) =>
              show(
                e,
                <>
                  <b>{p.name}</b>
                  <br />
                  <b>{p.quantity.toLocaleString("en-US")}</b> <span className="text-neutral-400">{piecesLabel}</span>
                </>,
              )
            }
            onMouseLeave={hide}
          >
            <div className="h-4 rounded bg-neutral-100" style={{ width: "100%" }}>
              <div
                className="h-4 rounded bg-[#2A78D6]"
                style={{ width: `${Math.max((p.quantity / max) * 100, 3)}%` }}
              />
            </div>
            <span className="w-10 flex-none text-right text-xs font-bold tabular-nums">{p.quantity}</span>
          </div>
        </div>
      ))}
      <ChartTooltip tooltip={tooltip} />
    </div>
  )
}
