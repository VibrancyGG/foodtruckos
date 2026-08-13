"use client"

import { useLang } from "@/lib/i18n/LangProvider"

// Llamativo sin ser intrusivo: una franja de color, no un modal — se ve en
// cada pantalla del panel mientras dure la ventana de aviso (últimos 5 días
// de prueba), pero nunca bloquea nada. El bloqueo real ocurre solo cuando
// la prueba ya venció de verdad (getOwnerContext trata eso como
// "suspended").
export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const { t } = useLang()
  return (
    <div className="bg-amber-400 px-4 py-2 text-center text-sm font-bold text-amber-950">
      {t.panel.trialBanner(daysLeft)}
    </div>
  )
}
