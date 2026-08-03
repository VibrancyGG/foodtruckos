"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { dictionary, type Dictionary, type Lang } from "./dictionary"

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: Dictionary
}>({ lang: "es", setLang: () => {}, t: dictionary.es })

const STORAGE_KEY = "ft_lang"

export function LangProvider({
  children,
  defaultLang = "es",
}: {
  children: ReactNode
  defaultLang?: Lang
}) {
  const [lang, setLangState] = useState<Lang>(defaultLang)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
      if (saved === "es" || saved === "en") setLangState(saved)
    } catch {
      // localStorage puede no estar disponible; se queda en el idioma por defecto.
    }
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      // sin persistencia si el navegador la bloquea; no es crítico.
    }
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: dictionary[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
