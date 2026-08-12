"use client"

import { useEffect, useRef, useState } from "react"
import { useLang } from "@/lib/i18n/LangProvider"
import { useOnboarding } from "./OnboardingProvider"
import { ONBOARDING_STEPS } from "@/lib/onboarding/steps"

const SPOTLIGHT_PAD = 8

// La tarjeta siempre vive fija abajo de la pantalla — nunca intenta
// posicionarse "junto" al elemento resaltado. Con 13 pasos saltando entre
// pantallas y tamaños de elemento muy distintos (un título, un botón chico,
// una tarjeta completa), calcular una posición flotante que nunca se salga
// de la pantalla es frágil; una barra inferior fija es robusta en cualquier
// tamaño, incluida la vista de celular que es el uso real de este panel.
export function OnboardingTour() {
  const { t } = useLang()
  const o = t.panel.onboarding
  const { active, stepIndex, totalSteps, next, back, skip } = useOnboarding()
  const step = ONBOARDING_STEPS[stepIndex]
  const [rect, setRect] = useState<DOMRect | null>(null)
  const attemptsRef = useRef(0)

  useEffect(() => {
    attemptsRef.current = 0
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRect(null)
    if (!active || !step?.target) return
    let cancelled = false

    function measure() {
      const el = document.querySelector(`[data-tour="${step.target}"]`)
      if (!el) return null
      return el.getBoundingClientRect()
    }

    function locate() {
      if (cancelled) return
      const el = document.querySelector(`[data-tour="${step.target}"]`)
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" })
        window.setTimeout(() => {
          if (!cancelled) setRect(measure())
        }, 260)
        return
      }
      attemptsRef.current += 1
      // Reintenta hasta 4s — cubre navegar de pantalla y esperar a que React
      // monte el elemento real, sin quedarse esperando para siempre si el
      // target ya no existe (p. ej. un dueño con 0 trucks entrando a Personal).
      if (attemptsRef.current < 40) window.setTimeout(locate, 100)
    }
    locate()

    function onViewportChange() {
      const r = measure()
      if (r) setRect(r)
    }
    window.addEventListener("scroll", onViewportChange, true)
    window.addEventListener("resize", onViewportChange)
    return () => {
      cancelled = true
      window.removeEventListener("scroll", onViewportChange, true)
      window.removeEventListener("resize", onViewportChange)
    }
  }, [active, step])

  if (!active || !step) return null

  const content = step.content(t)
  const isLast = stepIndex === totalSteps - 1

  return (
    <div className="fixed inset-0 z-[100]">
      {rect ? (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-white transition-all duration-200"
          style={{
            top: Math.max(0, rect.top - SPOTLIGHT_PAD),
            left: Math.max(0, rect.left - SPOTLIGHT_PAD),
            width: rect.width + SPOTLIGHT_PAD * 2,
            height: rect.height + SPOTLIGHT_PAD * 2,
            boxShadow: "0 0 0 9999px rgba(15,15,15,0.68)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/70" />
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">
              {o.stepOf(stepIndex + 1, totalSteps)}
            </span>
            <button onClick={skip} className="text-[11px] font-bold text-neutral-400 underline">
              {o.skip}
            </button>
          </div>
          <h3 className="mb-1.5 text-lg font-black">{content.title}</h3>
          <p className="mb-4 text-sm leading-relaxed text-neutral-600">{content.body}</p>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={back}
              disabled={stepIndex === 0}
              className="rounded-lg px-3 py-2 text-sm font-bold text-neutral-500 disabled:opacity-0"
            >
              {o.back}
            </button>
            <button
              onClick={next}
              className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-bold text-white"
            >
              {isLast ? o.finish : o.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
