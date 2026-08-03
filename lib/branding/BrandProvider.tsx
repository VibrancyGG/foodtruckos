"use client"

import { useEffect, type ReactNode } from "react"

// La marca del comensal es del negocio cliente, no de FoodTruckOS (regla de las
// dos marcas). Todo por variable CSS, nada fijo en el código de los componentes.
function luminance(hex: string) {
  const c = hex.replace("#", "").match(/../g)!.map((x) => {
    const v = parseInt(x, 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

function contrastRatio(a: string, b: string) {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

function onColorFor(hex: string) {
  const ink = "#1A1512"
  return contrastRatio(hex, "#FFFFFF") >= contrastRatio(hex, ink) ? "#FFFFFF" : ink
}

export function BrandProvider({
  brandColor,
  children,
}: {
  brandColor: string | null
  children: ReactNode
}) {
  const color = brandColor || "#D62828"

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--brand-primary", color)
    root.style.setProperty("--brand-on-primary", onColorFor(color))
  }, [color])

  return <>{children}</>
}
