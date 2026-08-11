"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { acknowledgeTruckApproval } from "@/lib/trucks/requests"
import { useLang } from "@/lib/i18n/LangProvider"

export function TruckApprovalBanner({ requestId, unitName }: { requestId: string; unitName: string }) {
  const { t } = useLang()
  const p = t.panel.truckApprovalBanner
  const [dismissed, setDismissed] = useState(false)
  const [pending, startTransition] = useTransition()

  if (dismissed) return null

  function dismiss() {
    setDismissed(true)
    startTransition(async () => {
      await acknowledgeTruckApproval(requestId)
    })
  }

  return (
    <div className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
      <div>
        <div className="text-sm font-black text-green-900">{p.title}</div>
        <p className="mt-0.5 text-xs text-green-800">{p.body(unitName)}</p>
      </div>
      <div className="flex flex-none items-center gap-2">
        <Link href="/panel/trucks" onClick={dismiss} className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-bold text-white">
          {p.cta}
        </Link>
        <button onClick={dismiss} disabled={pending} className="text-xs font-semibold text-green-700 underline">
          {p.dismiss}
        </button>
      </div>
    </div>
  )
}
