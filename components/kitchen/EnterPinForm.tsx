"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLang } from "@/lib/i18n/LangProvider"

const ERROR_KEY = {
  origin_not_allowed: "errOriginNotAllowed",
  invalid_device: "errInvalidDevice",
  missing_pin: "errMissingPin",
  locked: "errLocked",
  invalid_pin: "errInvalidPin",
} as const

export function EnterPinForm() {
  const router = useRouter()
  const { lang, setLang, t } = useLang()
  const [pin, setPin] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSending(true)
    setError(null)
    try {
      const res = await fetch("/cocina/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (!res.ok) {
        const key = ERROR_KEY[data.error as keyof typeof ERROR_KEY]
        setError(key ? t.kitchen[key] : t.kitchen.errInvalidPin)
        setPin("")
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
            <h1 className="text-lg font-bold">{t.kitchen.pinTitle}</h1>
            <p className="text-sm text-neutral-400">{t.kitchen.pinSubtitle}</p>
          </div>
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="flex-none rounded-full border border-neutral-600 px-3 py-1 text-xs font-semibold"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
        </div>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          type="password"
          inputMode="numeric"
          placeholder={t.kitchen.pinPlaceholder}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder:text-neutral-500"
          autoFocus
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={submit}
          disabled={sending || pin.length === 0}
          className="w-full rounded-xl bg-white py-3 font-bold text-neutral-900 disabled:opacity-50"
        >
          {sending ? t.kitchen.enteringLabel : t.kitchen.enterButton}
        </button>
      </div>
    </div>
  )
}
