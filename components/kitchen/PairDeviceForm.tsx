"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLang } from "@/lib/i18n/LangProvider"

const ERROR_KEY = {
  origin_not_allowed: "errOriginNotAllowed",
  missing_code: "errMissingCode",
  invalid_code: "errInvalidCode",
} as const

export function PairDeviceForm() {
  const router = useRouter()
  const { lang, setLang, t } = useLang()
  const [code, setCode] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSending(true)
    setError(null)
    try {
      const res = await fetch("/cocina/emparejar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        const key = ERROR_KEY[data.error as keyof typeof ERROR_KEY]
        setError(key ? t.kitchen[key] : t.kitchen.errInvalidCode)
        return
      }
      router.refresh()
    } catch {
      setError(t.kitchen.errConnection)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-900 p-4 text-white">
      <div className="w-full max-w-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">{t.kitchen.pairTitle}</h1>
            <p className="text-sm text-neutral-400">{t.kitchen.pairSubtitle}</p>
          </div>
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="flex-none rounded-full border border-neutral-600 px-3 py-1 text-xs font-semibold"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
        </div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t.kitchen.pairPlaceholder}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-center text-lg tracking-widest text-white placeholder:text-neutral-500"
          autoFocus
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={submit}
          disabled={sending || code.trim().length === 0}
          className="w-full rounded-xl bg-white py-3 font-bold text-neutral-900 disabled:opacity-50"
        >
          {sending ? t.kitchen.pairingLabel : t.kitchen.pairButton}
        </button>
      </div>
    </div>
  )
}
