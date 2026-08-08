"use client"

import { useState, type ReactNode } from "react"

type TooltipState = { content: ReactNode; x: number; y: number } | null

// Un solo tooltip flotante por gráfica, posicionado relativo al contenedor
// (no a la ventana) para que funcione igual en cualquier tamaño de pantalla.
export function useChartTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>(null)

  function show(e: React.MouseEvent, content: ReactNode) {
    const rect = e.currentTarget.closest("[data-chart-wrap]")?.getBoundingClientRect()
    if (!rect) return
    setTooltip({ content, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }
  function hide() {
    setTooltip(null)
  }

  return { tooltip, show, hide }
}

export function ChartTooltip({ tooltip }: { tooltip: { content: ReactNode; x: number; y: number } | null }) {
  if (!tooltip) return null
  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold leading-relaxed text-white"
      style={{ left: tooltip.x, top: tooltip.y - 10 }}
    >
      {tooltip.content}
    </div>
  )
}
