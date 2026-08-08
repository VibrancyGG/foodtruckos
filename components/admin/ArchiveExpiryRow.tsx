"use client"

import { useState, useTransition } from "react"
import { markArchiveWarned } from "@/lib/admin/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import type { AdminOverview } from "@/lib/admin/getAdminOverview"

export function ArchiveExpiryRow({ unit }: { unit: AdminOverview["archivedExpiring"][number] }) {
  const { lang, t } = useLang()
  const a = t.admin
  const locale = lang === "es" ? "es-MX" : "en-US"
  const [pending, startTransition] = useTransition()
  const [warned, setWarned] = useState(unit.warned)

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-neutral-800 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="font-semibold">
          {unit.businessName} · {unit.name}
        </div>
        <div className="text-xs text-neutral-500">
          {a.archivedOn(new Date(unit.archivedAt).toLocaleDateString(locale))} ·{" "}
          {unit.overdue ? (
            <span className="font-bold text-red-400">{a.retentionOverdue}</span>
          ) : (
            a.retentionMonthsLeft(24 - unit.monthsArchived)
          )}
        </div>
      </div>
      {warned ? (
        <span className="rounded-lg border border-green-800 px-2.5 py-1 text-xs font-bold text-green-300">
          {a.archiveContactedBadge}
        </span>
      ) : (
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await markArchiveWarned(unit.id)
              if (result.ok) setWarned(true)
            })
          }
          className="rounded-lg border border-neutral-700 px-2.5 py-1 text-xs font-bold text-neutral-300 hover:border-neutral-500"
        >
          {a.archiveMarkContacted}
        </button>
      )}
    </div>
  )
}
