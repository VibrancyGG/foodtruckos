"use client"

import { useLang } from "@/lib/i18n/LangProvider"

export default function SinAccesoPage() {
  const { t } = useLang()
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center">
      <h1 className="mb-2 text-lg font-bold">{t.panel.sinAccesoTitle}</h1>
      <p className="text-sm text-neutral-600">{t.panel.sinAccesoBody}</p>
    </div>
  )
}
