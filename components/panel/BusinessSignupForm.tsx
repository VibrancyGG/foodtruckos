"use client"

import { useState, useTransition } from "react"
import { submitBusinessSignupRequest } from "@/lib/business/signupRequests"
import { useLang } from "@/lib/i18n/LangProvider"

export function BusinessSignupForm() {
  const { t } = useLang()
  const p = t.panel.signupRequestPage
  const [businessName, setBusinessName] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await submitBusinessSignupRequest({ businessName, city, phone, note })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSent(true)
    })
  }

  if (sent) {
    return <p className="text-sm font-semibold text-green-700">{p.sent}</p>
  }

  return (
    <form onSubmit={submit} className="space-y-3 text-left">
      <p className="text-sm text-neutral-600">{p.intro}</p>
      <div>
        <label className="mb-1 block text-xs font-bold text-neutral-500">{p.businessNameLabel}</label>
        <input
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-neutral-500">{p.cityLabel}</label>
        <input
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-neutral-500">{p.phoneLabel}</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-neutral-500">{p.noteLabel}</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder={p.notePlaceholder}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? p.sending : p.submit}
      </button>
    </form>
  )
}
