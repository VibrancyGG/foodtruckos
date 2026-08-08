export function TopProductsChart({ products }: { products: { name: string; quantity: number }[] }) {
  if (products.length === 0) {
    return <p className="text-sm text-neutral-400">Todavía no hay pedidos este mes.</p>
  }
  const max = products[0].quantity

  return (
    <div className="space-y-2.5">
      {products.map((p) => (
        <div key={p.name}>
          <div className="mb-0.5 text-xs font-semibold">{p.name}</div>
          <div className="flex items-center gap-2">
            <div className="h-4 rounded bg-neutral-100" style={{ width: "100%" }}>
              <div
                className="h-4 rounded bg-[#2A78D6]"
                style={{ width: `${Math.max((p.quantity / max) * 100, 3)}%` }}
              />
            </div>
            <span className="w-10 flex-none text-right text-xs font-bold tabular-nums">{p.quantity}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
