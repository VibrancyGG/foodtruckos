"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { markOnboardingSeen } from "@/lib/onboarding/actions"
import { ONBOARDING_STEPS } from "@/lib/onboarding/steps"

const STORAGE_KEY = "ft_onboarding_step"

type OnboardingContextValue = {
  active: boolean
  stepIndex: number
  totalSteps: number
  next: () => void
  back: () => void
  skip: () => void
  restart: () => void
}

const OnboardingContext = createContext<OnboardingContextValue>({
  active: false,
  stepIndex: 0,
  totalSteps: ONBOARDING_STEPS.length,
  next: () => {},
  back: () => {},
  skip: () => {},
  restart: () => {},
})

// El tour vive un nivel arriba de cada pantalla (en el layout del panel) para
// sobrevivir a la navegación entre pasos — si viviera dentro de una pantalla
// se desmontaría al cambiar de ruta y perdería su estado a medio tour.
export function OnboardingProvider({ children, shouldAutoStart }: { children: ReactNode; shouldAutoStart: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  // Se decide después de montar, nunca en el render inicial — el servidor no
  // sabe si el dueño ya iba a la mitad del tour en una pestaña anterior.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        const idx = parseInt(saved, 10)
        if (!Number.isNaN(idx) && idx >= 0 && idx < ONBOARDING_STEPS.length) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setStepIndex(idx)
          setActive(true)
          return
        }
      }
      if (shouldAutoStart) {
        setActive(true)
      }
    } catch {
      if (shouldAutoStart) setActive(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Si el paso actual vive en otra pantalla, navega — así "Siguiente" cruza
  // de Menú a Trucks a Marca sin que el dueño tenga que hacer clic en el nav.
  useEffect(() => {
    if (!active) return
    const step = ONBOARDING_STEPS[stepIndex]
    if (step.route && step.route !== pathname) {
      router.push(step.route)
    }
  }, [active, stepIndex, pathname, router])

  function persist(idx: number) {
    try {
      localStorage.setItem(STORAGE_KEY, String(idx))
    } catch {
      // sin persistencia si el navegador la bloquea; el tour sigue funcionando en esta sesión.
    }
  }

  function clearPersisted() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // nada que limpiar si nunca se pudo guardar.
    }
  }

  const next = useCallback(() => {
    setStepIndex((i) => {
      const nextIdx = i + 1
      if (nextIdx >= ONBOARDING_STEPS.length) {
        setActive(false)
        clearPersisted()
        markOnboardingSeen()
        return i
      }
      persist(nextIdx)
      return nextIdx
    })
  }, [])

  const back = useCallback(() => {
    setStepIndex((i) => {
      const prevIdx = Math.max(0, i - 1)
      persist(prevIdx)
      return prevIdx
    })
  }, [])

  const skip = useCallback(() => {
    setActive(false)
    clearPersisted()
    markOnboardingSeen()
  }, [])

  const restart = useCallback(() => {
    setStepIndex(0)
    persist(0)
    setActive(true)
  }, [])

  return (
    <OnboardingContext.Provider
      value={{ active, stepIndex, totalSteps: ONBOARDING_STEPS.length, next, back, skip, restart }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  return useContext(OnboardingContext)
}
