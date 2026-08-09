"use client"

import { useLang } from "@/lib/i18n/LangProvider"
import { BusinessSignupForm } from "./BusinessSignupForm"

type PendingRequest = { id: string; business_name: string; city: string; created_at: string } | null

export function SinAccesoScreen({ pendingRequest }: { pendingRequest: PendingRequest }) {
  const { lang, t } = useLang()
  const p = t.panel.signupRequestPage
  const locale = lang === "es" ? "es-MX" : "en-US"

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center">
      {pendingRequest ? (
        <>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            {p.accountConfirmedBadge}
          </div>
          <h1 className="mb-2 text-lg font-bold">{p.pendingTitle}</h1>
          <p className="text-sm text-neutral-600">
            {p.pendingBody(pendingRequest.business_name, pendingRequest.city)}
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            {p.pendingSince(new Date(pendingRequest.created_at).toLocaleDateString(locale))}
          </p>
          <p className="mt-4 text-xs text-neutral-400">{p.pendingNoActionNeeded}</p>
        </>
      ) : (
        <>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            {p.accountConfirmedBadge}
          </div>
          <h1 className="mb-1 text-lg font-bold">{p.title}</h1>
          <p className="mb-3 text-xs font-semibold text-neutral-500">{p.oneStepLeft}</p>
          <BusinessSignupForm />
        </>
      )}
    </div>
  )
}
