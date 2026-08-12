"use client"

import { useState, useTransition } from "react"
import { useLang } from "@/lib/i18n/LangProvider"
import { suggestTranslation } from "@/lib/menu/translate"

// Botones opcionales junto a un campo bilingüe: "usar el mismo texto" (copia
// literal, solo tiene sentido español→inglés para nombres de campo que no se
// traducen) y "traducir con IA" (sugerencia editable, nunca se guarda sola —
// el dueño la ve en el campo y decide si la deja, la corrige o la borra).
export function TranslateFieldActions({
  sourceValue,
  setTarget,
  direction,
  allowCopy,
}: {
  sourceValue: string
  setTarget: (v: string) => void
  direction: "es-en" | "en-es"
  allowCopy?: boolean
}) {
  const { t } = useLang()
  const c = t.panel.common
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!sourceValue.trim()) return null

  function translate() {
    setError(null)
    startTransition(async () => {
      const result = await suggestTranslation(sourceValue, direction)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setTarget(result.text)
    })
  }

  return (
    <span className="flex items-center gap-2">
      {allowCopy && (
        <button type="button" onClick={() => setTarget(sourceValue)} className="text-[11px] font-bold text-neutral-400 underline">
          {c.copyFromSpanish}
        </button>
      )}
      <button
        type="button"
        onClick={translate}
        disabled={pending}
        className="text-[11px] font-bold text-neutral-400 underline disabled:opacity-50"
      >
        {pending ? c.translating : c.suggestTranslation}
      </button>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </span>
  )
}
