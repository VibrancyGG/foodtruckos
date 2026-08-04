type QrCode = { unitName: string; label: string; url: string; qrDataUrl: string }

export function QrScreen({ codes }: { codes: QrCode[] }) {
  if (codes.length === 0) {
    return <p className="text-sm text-neutral-500">Todavía no hay ningún truck activo.</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {codes.map((c) => (
        <div key={c.url} className="rounded-2xl border border-neutral-200 bg-white p-4 text-center">
          <div className="mb-1 text-sm font-bold">{c.unitName}</div>
          <div className="mb-3 text-xs text-neutral-500">{c.label}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.qrDataUrl} alt={`Código QR de ${c.unitName}`} className="mx-auto h-48 w-48" />
          <p className="mt-3 break-all text-[11px] text-neutral-400">{c.url}</p>
          <a
            href={c.qrDataUrl}
            download={`qr-${c.unitName.toLowerCase().replace(/\s+/g, "-")}.png`}
            className="mt-3 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-xs font-bold text-white"
          >
            Descargar para imprimir
          </a>
        </div>
      ))}
    </div>
  )
}
