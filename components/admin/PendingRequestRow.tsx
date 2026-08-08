"use client"

import { useState, useTransition } from "react"
import { approveTruckRequest, rejectTruckRequest } from "@/lib/trucks/requests"
import { useLang } from "@/lib/i18n/LangProvider"
import type { AdminOverview } from "@/lib/admin/getAdminOverview"

export function PendingRequestRow({ request }: { request: AdminOverview["pendingRequests"][number] }) {
  const { lang, t } = useLang()
  const a = t.admin
  const locale = lang === "es" ? "es-MX" : "en-US"
  const [pending, startTransition] = useTransition()
  const [gone, setGone] = useState(false)

  if (gone) return null

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-neutral-800 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{request.businessName}</div>
        <div className="text-xs text-neutral-500">
          {a.requestedOn(new Date(request.created_at).toLocaleDateString(locale))} · {a.currentTrucksLabel(request.currentTrucks)}
          {request.note ? ` · ${request.note}` : ""}
        </div>
      </div>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await rejectTruckRequest(request.id)
            if (result.ok) setGone(true)
          })
        }
        className="rounded-lg border border-neutral-700 px-2.5 py-1 text-xs font-bold text-neutral-300 hover:border-red-800 hover:text-red-300"
      >
        {a.requestReject}
      </button>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await approveTruckRequest(request.id)
            if (result.ok) setGone(true)
          })
        }
        className="rounded-lg border border-green-800 px-2.5 py-1 text-xs font-bold text-green-300"
      >
        {a.requestApprove}
      </button>
    </div>
  )
}
