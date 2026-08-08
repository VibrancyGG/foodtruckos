"use client"

import { useTransition } from "react"
import { suspendBusiness, reactivateBusiness } from "@/lib/admin/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import type { AdminOverview } from "@/lib/admin/getAdminOverview"

const STATUS_STYLE: Record<string, string> = {
  trial: "bg-blue-950 text-blue-300",
  active: "bg-green-950 text-green-300",
  suspended: "bg-red-950 text-red-300",
  cancelled: "bg-neutral-800 text-neutral-400",
}

export function BusinessRow({ business }: { business: AdminOverview["businesses"][number] }) {
  const { t } = useLang()
  const a = t.admin
  const STATUS_LABEL: Record<string, string> = {
    trial: a.statusTrial,
    active: a.statusActive,
    suspended: a.statusSuspended,
    cancelled: a.statusCancelled,
  }
  const [pending, startTransition] = useTransition()

  return (
    <tr className="border-b border-neutral-800">
      <td className="py-2.5 pr-3">
        <div className="font-semibold">{business.name}</div>
        <div className="text-xs text-neutral-500">/{business.slug}</div>
      </td>
      <td className="py-2.5 pr-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[business.subscription_status] ?? "bg-neutral-800 text-neutral-400"}`}>
          {STATUS_LABEL[business.subscription_status] ?? business.subscription_status}
        </span>
      </td>
      <td className="py-2.5 pr-3 text-sm">{business.activeTrucks}</td>
      <td className="py-2.5 pr-3 text-sm font-semibold">
        ${business.total}
        {a.perMonth}
      </td>
      <td className="py-2.5 pr-3 text-xs text-neutral-500">
        {business.billing_mode === "stripe" ? a.payStripe : a.payManual}
      </td>
      <td className="py-2.5 text-right">
        <div className="flex justify-end gap-1.5">
          {business.subscription_status === "suspended" || !business.openUrl ? (
            <span className="cursor-not-allowed rounded-lg border border-neutral-800 px-2.5 py-1 text-xs font-bold text-neutral-600" title={a.openDisabled}>
              {a.openLink}
            </span>
          ) : (
            <a
              href={business.openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-neutral-700 px-2.5 py-1 text-xs font-bold text-neutral-300 hover:border-neutral-500"
            >
              {a.openLink}
            </a>
          )}
          {business.subscription_status === "suspended" ? (
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await reactivateBusiness(business.id)
                })
              }
              className="rounded-lg border border-green-800 px-2.5 py-1 text-xs font-bold text-green-300"
            >
              {a.reactivate}
            </button>
          ) : (
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await suspendBusiness(business.id)
                })
              }
              className="rounded-lg border border-neutral-700 px-2.5 py-1 text-xs font-bold text-neutral-300 hover:border-red-800 hover:text-red-300"
            >
              {a.suspend}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
