"use client"

import { useTransition } from "react"
import { suspendBusiness, reactivateBusiness } from "@/lib/admin/actions"
import type { AdminOverview } from "@/lib/admin/getAdminOverview"

const STATUS_STYLE: Record<string, string> = {
  trial: "bg-blue-950 text-blue-300",
  active: "bg-green-950 text-green-300",
  suspended: "bg-red-950 text-red-300",
  cancelled: "bg-neutral-800 text-neutral-400",
}

export function BusinessRow({ business }: { business: AdminOverview["businesses"][number] }) {
  const [pending, startTransition] = useTransition()

  return (
    <tr className="border-b border-neutral-800">
      <td className="py-2.5 pr-3">
        <div className="font-semibold">{business.name}</div>
        <div className="text-xs text-neutral-500">/{business.slug}</div>
      </td>
      <td className="py-2.5 pr-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[business.subscription_status] ?? "bg-neutral-800 text-neutral-400"}`}>
          {business.subscription_status}
        </span>
      </td>
      <td className="py-2.5 pr-3 text-sm">{business.activeTrucks}</td>
      <td className="py-2.5 pr-3 text-sm font-semibold">${business.total}/mes</td>
      <td className="py-2.5 pr-3 text-xs text-neutral-500">{business.billing_mode}</td>
      <td className="py-2.5 text-right">
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
            Reactivar
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
            Suspender
          </button>
        )}
      </td>
    </tr>
  )
}
