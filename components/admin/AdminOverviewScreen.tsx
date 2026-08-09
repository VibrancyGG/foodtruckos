"use client"

import { useLang } from "@/lib/i18n/LangProvider"
import type { AdminOverview } from "@/lib/admin/getAdminOverview"
import { BusinessRow } from "./BusinessRow"
import { MrrTrendChart } from "./MrrTrendChart"
import { PendingRequestRow } from "./PendingRequestRow"
import { ArchiveExpiryRow } from "./ArchiveExpiryRow"
import { BusinessSignupRequestRow } from "./BusinessSignupRequestRow"

const CARTERA_COLOR: Record<string, string> = {
  trial: "#1F5FBF",
  active: "#16A34A",
  suspended: "#DC2626",
  cancelled: "#71717a",
}

export function AdminOverviewScreen({ businesses, mrr, trucksBilled, avgTenureMonths, perClientAvg, cartera, mrrHistory, pendingRequests, pendingBusinessSignups, archivedExpiring, activity }: AdminOverview) {
  const { lang, t } = useLang()
  const a = t.admin
  const locale = lang === "es" ? "es-MX" : "en-US"
  const ACTION_LABEL: Record<string, string> = {
    product_price_changed: a.actionPriceChange,
    subscription_cancel_requested: a.actionCancelRequested,
    unit_paused: a.actionUnitPaused,
    unit_reopened: a.actionUnitReopened,
    unit_archived: a.actionUnitArchived,
    unit_reactivated: a.actionUnitReactivated,
    business_suspended: a.actionBusinessSuspended,
    business_reactivated: a.actionBusinessReactivated,
    truck_request_approved: a.actionTruckRequestApproved,
    truck_request_rejected: a.actionTruckRequestRejected,
    admin_viewed_business: a.actionAdminViewedBusiness,
    archive_warning_sent: a.actionArchiveWarningSent,
    business_signup_approved: a.actionBusinessSignupApproved,
    business_signup_rejected: a.actionBusinessSignupRejected,
    product_retired: a.actionProductRetired,
    product_created: a.actionProductCreated,
    staff_created: a.actionStaffCreated,
    staff_pin_reset: a.actionStaffPinReset,
    staff_removed: a.actionStaffRemoved,
    device_created: a.actionDeviceCreated,
    device_revoked: a.actionDeviceRevoked,
  }
  const STATUS_LABEL: Record<string, string> = {
    trial: a.statusTrial,
    active: a.statusActive,
    suspended: a.statusSuspended,
    cancelled: a.statusCancelled,
  }
  const billableCount = businesses.filter((b) => b.subscription_status === "active" || b.subscription_status === "trial").length

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-800 sm:grid-cols-3">
        {[
          { label: a.kpiActiveBusinesses, value: String(billableCount) },
          { label: a.kpiTrucksBilled, value: String(trucksBilled) },
          { label: a.kpiMonthlyRevenue, value: `$${Math.round(mrr).toLocaleString("en-US")}` },
          { label: a.kpiAvgTenure, value: avgTenureMonths.toFixed(1), hint: a.kpiAvgTenureUnit },
          { label: a.kpiPerClient, value: `$${Math.round(perClientAvg).toLocaleString("en-US")}`, hint: a.kpiAvgTenureUnit },
        ].map((k) => (
          <div key={k.label} className="bg-neutral-900 p-4">
            <div className="text-2xl font-black tabular-nums">{k.value}</div>
            <div className="mt-1.5 text-[11px] font-bold uppercase tracking-wide text-neutral-500">{k.label}</div>
            {k.hint && <div className="mt-0.5 text-[11px] text-neutral-600">{k.hint}</div>}
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">{a.platformHealthHeader}</h2>
        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">{a.monthlyRevenuePanelTitle}</div>
            <div className="mb-2 text-lg font-black">
              ${Math.round(mrr).toLocaleString("en-US")} {a.thisMonthLabel}
            </div>
            <MrrTrendChart history={mrrHistory} lang={lang} />
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">{a.portfolioPanelTitle}</div>
            <div className="mb-3 text-lg font-black">{a.portfolioTotalLabel(businesses.length)}</div>
            <div className="space-y-2">
              {cartera.map((c) => {
                const pct = businesses.length ? Math.round((c.count / businesses.length) * 100) : 0
                return (
                  <div key={c.status} className="flex items-center gap-2.5">
                    <span className="w-16 flex-none text-xs font-semibold text-neutral-400">{STATUS_LABEL[c.status]}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-800">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CARTERA_COLOR[c.status] }} />
                    </div>
                    <span className="w-5 flex-none text-right text-xs font-black tabular-nums">{c.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
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
        <h2 className="mb-3 text-sm font-bold">{a.businessSignupsHeader}</h2>
        {pendingBusinessSignups.length === 0 ? (
          <p className="text-sm text-neutral-500">{a.noBusinessSignups}</p>
        ) : (
          <div>
            {pendingBusinessSignups.map((r) => (
              <BusinessSignupRequestRow key={r.id} request={r} />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="mb-3 text-sm font-bold">{a.pendingRequestsHeader}</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-neutral-500">{a.noPendingRequests}</p>
        ) : (
          <div>
            {pendingRequests.map((r) => (
              <PendingRequestRow key={r.id} request={r} />
            ))}
          </div>
        )}
      </div>

      {archivedExpiring.length > 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="mb-1 text-sm font-bold">{a.archivedExpiryHeader}</h2>
          <p className="mb-3 text-xs text-neutral-500">{a.archivedExpiryHint}</p>
          <div>
            {archivedExpiring.map((u) => (
              <ArchiveExpiryRow key={u.id} unit={u} />
            ))}
          </div>
        </div>
      )}

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

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm leading-relaxed text-neutral-400">
        <p>
          <span className="font-bold text-neutral-200">{a.billingNoteTitle}</span> {a.billingNoteBody}
        </p>
        <p className="mt-3">
          <span className="font-bold text-neutral-200">{a.billingRuleTitle}</span> {a.billingRuleBody}
        </p>
      </div>
    </div>
  )
}
