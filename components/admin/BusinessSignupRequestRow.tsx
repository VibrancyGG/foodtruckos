"use client"

import { useState, useTransition } from "react"
import { approveBusinessSignup, rejectBusinessSignup } from "@/lib/admin/businessSignupRequests"
import { useLang } from "@/lib/i18n/LangProvider"
import type { AdminOverview } from "@/lib/admin/getAdminOverview"

export function BusinessSignupRequestRow({ request }: { request: AdminOverview["pendingBusinessSignups"][number] }) {
  const { lang, t } = useLang()
  const a = t.admin
  const locale = lang === "es" ? "es-MX" : "en-US"
  const [pending, startTransition] = useTransition()
  const [gone, setGone] = useState(false)
  const [approving, setApproving] = useState(false)
  const [unitName, setUnitName] = useState("Truck 1")
  const [unitLocation, setUnitLocation] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (gone) return null

  function confirmApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveBusinessSignup(request.id, { unitName, unitLocation })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setGone(true)
    })
  }

  return (
    <div className="border-b border-neutral-800 py-3 last:border-0">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{request.business_name}</div>
          <div className="text-xs text-neutral-500">
            {request.city} · {request.contact_email}
            {request.phone ? ` · ${request.phone}` : ""} ·{" "}
            {a.requestedOn(new Date(request.created_at).toLocaleDateString(locale))}
            {request.note ? ` · ${request.note}` : ""}
          </div>
        </div>
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await rejectBusinessSignup(request.id)
              if (result.ok) setGone(true)
            })
          }
          className="rounded-lg border border-neutral-700 px-2.5 py-1 text-xs font-bold text-neutral-300 hover:border-red-800 hover:text-red-300"
        >
          {a.requestReject}
        </button>
        <button
          onClick={() => setApproving((v) => !v)}
          className="rounded-lg border border-green-800 px-2.5 py-1 text-xs font-bold text-green-300"
        >
          {a.businessSignupApprove}
        </button>
      </div>
      {approving && (
        <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold text-neutral-500">{a.firstUnitNameLabel}</label>
            <input
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-neutral-500">{a.firstUnitLocationLabel}</label>
            <input
              value={unitLocation}
              onChange={(e) => setUnitLocation(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <button
            disabled={pending}
            onClick={confirmApprove}
            className="rounded-lg bg-green-800 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
          >
            {pending ? a.businessSignupApproving : a.businessSignupConfirm}
          </button>
          {error && <p className="w-full text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  )
}
