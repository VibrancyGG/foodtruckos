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
      // Se lee después de montar (nunca en el render inicial) para no romper
      // la hidratación: el servidor no conoce el idioma guardado del cliente.
      if (saved === "es" || saved === "en") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLangState(saved)
        return
      }
      // Sin preferencia guardada todavía (primera visita, o llega desde el
      // landing público): se adopta el idioma del dispositivo en vez del
      // default fijo, para que login/registro no "se sienta" en otro idioma
      // que el resto de lo que el cliente ya vio.
      const deviceLang = (navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en"
      setLangState(deviceLang)
    } catch {
      // localStorage/navigator pueden no estar disponibles; se queda en el idioma por defecto.
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
