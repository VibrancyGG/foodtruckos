import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { createClient } from "@/lib/supabase/server"
import { LogoUploadForm } from "@/components/auth/LogoUploadForm"

// Stub deliberado de esta fase: solo prueba la cadena completa (sesión → RLS
// → Storage → foto visible en el menú real). No es la pantalla de Marca
// todavía — este código es la base de la que esa pantalla crece después.
export default async function PanelPage() {
  const { businessId } = await getOwnerContext()

  if (!businessId) redirect("/panel/sin-acceso")

  const supabase = await createClient()
  const { data: business } = await supabase
    .from("businesses")
    .select("name, slug, logo_url")
    .eq("id", businessId)
    .single()

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl bg-white p-6">
      <div>
        <h1 className="text-lg font-bold">{business?.name}</h1>
        <p className="text-xs text-neutral-500">/{business?.slug}</p>
      </div>
      <LogoUploadForm currentLogoUrl={business?.logo_url ?? null} />
    </div>
  )
}
