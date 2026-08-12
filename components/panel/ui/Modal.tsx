"use client"

import type { ReactNode } from "react"
import { createPortal } from "react-dom"

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
} as const

// Único punto de verdad para el "cascarón" de cualquier tarjeta modal del
// panel — mismo backdrop, misma entrada, mismo radio/sombra en las 10+
// pantallas que abren una. Cambiar la sensación de "esto se siente premium"
// se hace una vez aquí, no repetido en cada archivo.
//
// Nunca se cierra al hacer clic afuera (ver feedback: el dueño perdía
// datos a medio llenar) — la única salida es el botón de cerrar explícito
// que cada pantalla ya trae en su propio pie (Cancelar/Guardar).
//
// Se monta con un portal directo a <body>: cualquier ancestro con una
// animación CSS activa (aunque termine en una transformación "identidad")
// se vuelve containing block de sus descendientes fixed y saca el modal
// del centro del viewport — pasó con el wrapper animado del layout del
// panel. El portal hace que esto sea imposible sin importar qué animación
// se agregue después en cualquier pantalla.
export function Modal({
  size = "md",
  scroll = false,
  children,
}: {
  size?: keyof typeof SIZES
  scroll?: boolean
  children: ReactNode
}) {
  // Sin guardia de montaje: el Modal solo se renderiza tras una interacción
  // del usuario (un estado que se activa con un clic), nunca en el render
  // inicial del servidor, así que document ya existe la primera vez que
  // esto corre.
  if (typeof document === "undefined") return null

  return createPortal(
    <div className="panel-backdrop-in fixed inset-0 z-50 grid place-items-center bg-[#17140f]/55 p-4 backdrop-blur-[2px] sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        className={`panel-modal-in w-full ${SIZES[size]} ${scroll ? "max-h-[88vh] overflow-y-auto" : ""} rounded-[22px] border border-black/5 bg-panel-surface p-6 shadow-[0_24px_70px_-20px_rgba(23,20,15,0.35)]`}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
