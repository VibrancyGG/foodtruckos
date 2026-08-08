"use client"

import { useLang } from "@/lib/i18n/LangProvider"
import type { AdminOverview } from "@/lib/admin/getAdminOverview"
import { BusinessRow } from "./BusinessRow"

export function AdminOverviewScreen({ businesses, mrr, activity }: AdminOverview) {
  const { lang, t } = useLang()
  const a = t.admin
  const locale = lang === "es" ? "es-MX" : "en-US"
  const ACTION_LABEL: Record<string, string> = {
    price_change: a.actionPriceChange,
    subscription_cancel_requested: a.actionCancelRequested,
    unit_paused: a.actionUnitPaused,
    unit_reopened: a.actionUnitReopened,
    unit_archived: a.actionUnitArchived,
    unit_reactivated: a.actionUnitReactivated,
    business_suspended: a.actionBusinessSuspended,
    business_reactivated: a.actionBusinessReactivated,
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="text-xs font-bold uppercase tracking-wide text-neutral-500">{a.mrr}</div>
        <div className="text-3xl font-black">${mrr}</div>
        <div className="mt-1 text-xs text-neutral-500">{a.businessesTotal(businesses.length)}</div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="mb-3 text-sm font-bold">{a.businessesHeader}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs text-neutral-500">
                <th className="pb-2 font-semibold">{a.colBusiness}</th>
                <th className="pb-2 font-semibold">{a.colStatus}</th>
                <th className="pb-2 font-semibold">{a.colTrucks}</th>
                <th className="pb-2 font-semibold">{a.colPlan}</th>
                <th className="pb-2 font-semibold">{a.colBilling}</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <BusinessRow key={b.id} business={b} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="mb-3 text-sm font-bold">{a.recentActivity}</h2>
        <div className="space-y-2 text-sm">
          {activity.length === 0 && <p className="text-neutral-500">{a.noActivity}</p>}
          {activity.map((act) => (
            <div key={act.id} className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div>
                <span className="font-semibold">{act.businessName}</span>{" "}
                <span className="text-neutral-400">
                  {ACTION_LABEL[act.action] ?? act.action} · {act.actor_type}
                </span>
              </div>
              <span className="text-xs text-neutral-500">
                {new Date(act.created_at).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
