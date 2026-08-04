"use client"

import { useEffect, type ReactNode } from "react"
import { onColorFor } from "./color"

// La marca del comensal es del negocio cliente, no de FoodTruckOS (regla de las
// dos marcas). Todo por variable CSS, nada fijo en el código de los componentes.
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
