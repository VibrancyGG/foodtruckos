"use client"

import { useEffect, useRef, useState } from "react"

// Cuenta hacia el valor real al montar — nunca inventa el número final antes
// de tiempo ni lo recalcula con datos falsos, solo anima la manera en que el
// mismo dato real aparece en pantalla. Respeta prefers-reduced-motion.
export function StatNumber({
  value,
  format,
  durationMs = 900,
  className,
}: {
  value: number
  format: (n: number) => string
  durationMs?: number
  className?: string
}) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced || value === 0) {
      const frame = requestAnimationFrame(() => setDisplay(value))
      return () => cancelAnimationFrame(frame)
    }
    startRef.current = null
    let frame: number

    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(1, elapsed / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, durationMs])

  return <span className={className}>{format(display)}</span>
}
