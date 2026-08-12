"use client"

import Link from "next/link"
import { useLang } from "@/lib/i18n/LangProvider"
import { Button } from "./ui/Button"

type QrCode = { unitName: string; label: string; url: string; qrDataUrl: string }

export function QrScreen({
  codes,
  businessName,
  brandColor,
}: {
  codes: QrCode[]
  businessName: string
  brandColor: string
}) {
  const { t } = useLang()
  const p = t.panel.qrPage

  return (
    <div>
      <div className="panel-animate-in print:hidden">
        <h1 className="mb-1 font-[family-name:var(--font-panel-display)] text-2xl font-bold text-panel-ink">{p.title}</h1>
        <p className="mb-4 text-sm text-panel-ink-soft">{p.subtitle}</p>

        <div className="mb-5 rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-sm font-bold text-emerald-900">{p.realTitle}</div>
          <p className="mt-1 text-xs text-emerald-800">{p.realBody}</p>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-panel-line bg-panel-surface p-4 shadow-[0_1px_2px_rgba(23,20,15,0.04)]">
          <div>
            <div className="text-sm font-bold text-panel-ink">{p.viewKitchenTitle}</div>
            <p className="mt-0.5 text-xs text-panel-ink-soft">{p.viewKitchenBody}</p>
          </div>
          <Link
            href="/panel/cocina"
            className="flex-none rounded-xl bg-panel-brand px-4 py-2.5 text-xs font-bold text-white shadow-[0_1px_2px_rgba(226,67,31,0.25)] transition-all duration-150 hover:bg-panel-brand-deep active:scale-[0.98]"
          >
            {p.viewKitchenCta}
          </Link>
        </div>
      </div>

      {codes.length > 0 && (
        <div className="panel-animate-in mb-4 print:hidden" style={{ animationDelay: "40ms" }}>
          <Button onClick={() => window.print()}>{p.printAll}</Button>
        </div>
      )}

      <div className="print:hidden">
      {codes.length === 0 ? (
        <p className="text-sm text-panel-ink-soft">{p.noActiveTrucks}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {codes.map((c, i) => (
            <div
              key={c.url}
              className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-4 text-center shadow-[0_1px_2px_rgba(23,20,15,0.04)]"
              style={{ animationDelay: `${80 + i * 40}ms` }}
            >
              <div className="mb-1 text-sm font-bold text-panel-ink">{c.unitName}</div>
              <div className="mb-3 text-xs text-panel-ink-soft">{c.label}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.qrDataUrl} alt={`QR — ${c.unitName}`} className="mx-auto h-48 w-48" />
              <p className="mt-3 break-all text-[11px] text-panel-ink/40">{c.url}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <a
                  href={c.qrDataUrl}
                  download={`qr-${c.unitName.toLowerCase().replace(/\s+/g, "-")}.png`}
                  className="inline-block rounded-xl bg-panel-brand px-4 py-2 text-xs font-bold text-white shadow-[0_1px_2px_rgba(226,67,31,0.25)] transition-all duration-150 hover:bg-panel-brand-deep active:scale-[0.98]"
                >
                  {p.download}
                </a>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-xl border border-panel-line px-4 py-2 text-xs font-bold text-panel-ink transition-colors hover:border-panel-brand hover:text-panel-brand"
                >
                  {p.openMenu}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {codes.length > 0 && (
        <div className="panel-animate-in mt-6 rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)]">
          <h2 className="mb-3 text-sm font-bold text-panel-ink">{p.howToTitle}</h2>
          <ol className="list-decimal space-y-2 pl-4 text-sm text-panel-ink-soft">
            <li>{p.how1}</li>
            <li>{p.how2}</li>
            <li>{p.how3}</li>
            <li>{p.how4}</li>
          </ol>
        </div>
      )}
      </div>

      <div className="hidden print:block">
        {codes.map((c) => (
          <div key={c.url} className="break-after-page text-center last:break-after-auto">
            <div
              className="rounded-t-2xl px-6 pt-10 pb-8"
              style={{ background: brandColor, color: "#fff", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
            >
              <h2 className="text-4xl font-black uppercase tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                {businessName}
              </h2>
              <p className="mt-2 text-sm font-semibold">
                {c.unitName} · {c.label}
              </p>
            </div>
            <div className="rounded-b-2xl border border-t-0 border-neutral-300 p-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.qrDataUrl} alt={`QR — ${c.unitName}`} className="mx-auto h-64 w-64" />
              <p className="mt-6 text-xl font-extrabold">{p.posterMsg}</p>
              <p className="mt-1 text-base font-semibold text-neutral-500">{p.posterMsg2}</p>
              <p className="mt-6 text-xs text-neutral-400">{c.url}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
