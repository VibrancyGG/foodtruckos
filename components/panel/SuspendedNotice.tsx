"use client"

import { useLang } from "@/lib/i18n/LangProvider"

export function SuspendedNotice() {
  const { t } = useLang()
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center">
      <h1 className="mb-2 text-lg font-bold text-red-700">{t.panel.suspendedTitle}</h1>
      <p className="text-sm text-neutral-600">{t.panel.suspendedBody}</p>
    </div>
  )
}
