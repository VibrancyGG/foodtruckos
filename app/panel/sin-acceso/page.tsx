import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyPendingBusinessSignupRequest } from "@/lib/business/signupRequests"
import { SinAccesoScreen } from "@/components/panel/SinAccesoScreen"
import { avisarAdmin } from "@/lib/notificaciones/avisoAdmin"

export default async function SinAccesoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const pendingRequest = await getMyPendingBusinessSignupRequest()

  // Quien llega aquí sin solicitud (típicamente entró con Google desde
  // "Iniciar sesión" en vez de "Registrarse") puede irse sin llenar nada, y
  // antes no nos enterábamos. La base decide si toca avisar y garantiza que
  // sea una sola vez por cuenta.
  if (!pendingRequest) {
    const { data: tocaAvisar } = await supabase.rpc("claim_orphan_account_notice")
    if (tocaAvisar) {
      const meta = user.user_metadata ?? {}
      const nombre = (meta.full_name as string | undefined) ?? (meta.name as string | undefined) ?? ""
      avisarAdmin({
        asunto: `Cuenta nueva sin solicitud: ${nombre || user.email}`,
        titulo: "Alguien creó su cuenta pero aún no envía su solicitud",
        datos: [
          ["Nombre", nombre],
          ["Correo", user.email ?? ""],
          ["Entró con", user.app_metadata?.provider === "google" ? "Google" : "Enlace por correo"],
        ],
        nota: "Puede que la complete en unos minutos; si es así, te llegará también el aviso de negocio nuevo. Si no, escríbele: aparece en Admin → Cuentas sin negocio.",
        destino: "/admin",
      })
    }
  }

  return <SinAccesoScreen pendingRequest={pendingRequest} />
}
