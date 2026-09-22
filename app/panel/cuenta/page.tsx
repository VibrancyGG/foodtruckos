import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { createClient } from "@/lib/supabase/server"
import { getOwnerBilling } from "@/lib/billing/getOwnerBilling"
import { CuentaScreen } from "@/components/panel/CuentaScreen"

export default async function PanelCuentaPage() {
  const { businessId, user, impersonating } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const billing = await getOwnerBilling(businessId)

  // Esta tarjeta dice "lo que sale en el recibo". Cuando un admin entra a ver
  // el negocio de un cliente, mostrar SU propio correo ahí no es un detalle
  // cosmético: afirma que a ese cliente se le factura a una dirección que no
  // es la suya. Se muestra el correo del dueño real, y se calla el método de
  // ingreso — ese sí es de quien tiene la sesión, y del dueño no lo sabemos.
  let ownerEmail = user?.email ?? ""
  if (impersonating) {
    const supabase = await createClient()
    const { data } = await supabase.rpc("admin_owner_email", { p_business_id: businessId })
    ownerEmail = data ?? ""
  }
  // El teléfono vive aparte de businesses porque el menú público lee esa
  // tabla entera; aquí lo lee el dueño (o el admin viendo como él).
  const supabaseContacto = await createClient()
  const { data: contacto } = await supabaseContacto
    .from("business_contacts")
    .select("phone")
    .eq("business_id", businessId)
    .maybeSingle()

  const signInMethod = user?.app_metadata?.provider === "google" ? "google" : "password"

  return (
    <div className="mx-auto max-w-2xl">
      <CuentaScreen
        billing={billing}
        ownerEmail={ownerEmail}
        phone={contacto?.phone ?? null}
        signInMethod={signInMethod}
        impersonating={impersonating}
      />
    </div>
  )
}
