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
          <h1 className="mb-2 text-lg font-bold">{p.pendingTitle}</h1>
          <p className="text-sm text-neutral-600">
            {p.pendingBody(pendingRequest.business_name, pendingRequest.city)}
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            {p.pendingSince(new Date(pendingRequest.created_at).toLocaleDateString(locale))}
          </p>
        </>
      ) : (
        <>
          <h1 className="mb-3 text-lg font-bold">{p.title}</h1>
          <BusinessSignupForm />
        </>
      )}
    </div>
  )
}
