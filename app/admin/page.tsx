import { getAdminOverview } from "@/lib/admin/getAdminOverview"
import { BusinessRow } from "@/components/admin/BusinessRow"

const ACTION_LABEL: Record<string, string> = {
  price_change: "Cambio de precio",
  subscription_cancel_requested: "Pidió cancelar",
  unit_paused: "Pausó un truck",
  unit_reopened: "Reabrió un truck",
  unit_archived: "Archivó un truck",
  unit_reactivated: "Reactivó un truck",
  business_suspended: "Negocio suspendido",
  business_reactivated: "Negocio reactivado",
}

export default async function AdminPage() {
  const { businesses, mrr, activity } = await getAdminOverview()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="text-xs font-bold uppercase tracking-wide text-neutral-500">
          Ingreso mensual recurrente
        </div>
        <div className="text-3xl font-black">${mrr}</div>
        <div className="mt-1 text-xs text-neutral-500">
          {businesses.length} negocio{businesses.length === 1 ? "" : "s"} en total
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="mb-3 text-sm font-bold">Negocios</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs text-neutral-500">
                <th className="pb-2 font-semibold">Negocio</th>
                <th className="pb-2 font-semibold">Estado</th>
                <th className="pb-2 font-semibold">Trucks</th>
                <th className="pb-2 font-semibold">Plan</th>
                <th className="pb-2 font-semibold">Cobro</th>
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
        <h2 className="mb-3 text-sm font-bold">Actividad reciente</h2>
        <div className="space-y-2 text-sm">
          {activity.length === 0 && <p className="text-neutral-500">Sin actividad todavía.</p>}
          {activity.map((a) => (
            <div key={a.id} className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div>
                <span className="font-semibold">{a.businessName}</span>{" "}
                <span className="text-neutral-400">
                  {ACTION_LABEL[a.action] ?? a.action} · {a.actor_type}
                </span>
              </div>
              <span className="text-xs text-neutral-500">
                {new Date(a.created_at).toLocaleString("es-MX", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
