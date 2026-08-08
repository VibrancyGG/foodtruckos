"use client"

import { useLang } from "@/lib/i18n/LangProvider"

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
      <div className="print:hidden">
        <h1 className="mb-1 text-2xl font-black">{p.title}</h1>
        <p className="mb-4 text-sm text-neutral-500">{p.subtitle}</p>

        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="text-sm font-bold text-green-900">{p.realTitle}</div>
          <p className="mt-1 text-xs text-green-800">{p.realBody}</p>
        </div>
      </div>

      {codes.length > 0 && (
        <div className="mb-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white"
          >
            {p.printAll}
          </button>
        </div>
      )}

      <div className="print:hidden">
      {codes.length === 0 ? (
        <p className="text-sm text-neutral-500">{p.noActiveTrucks}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {codes.map((c) => (
            <div key={c.url} className="rounded-2xl border border-neutral-200 bg-white p-4 text-center">
              <div className="mb-1 text-sm font-bold">{c.unitName}</div>
              <div className="mb-3 text-xs text-neutral-500">{c.label}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.qrDataUrl} alt={`QR — ${c.unitName}`} className="mx-auto h-48 w-48" />
              <p className="mt-3 break-all text-[11px] text-neutral-400">{c.url}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <a
                  href={c.qrDataUrl}
                  download={`qr-${c.unitName.toLowerCase().replace(/\s+/g, "-")}.png`}
                  className="inline-block rounded-lg bg-neutral-900 px-4 py-2 text-xs font-bold text-white"
                >
                  {p.download}
                </a>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg border border-neutral-300 px-4 py-2 text-xs font-bold text-neutral-700"
                >
                  {p.openMenu}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {codes.length > 0 && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-bold">{p.howToTitle}</h2>
          <ol className="list-decimal space-y-2 pl-4 text-sm text-neutral-600">
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
