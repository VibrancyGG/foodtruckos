import "server-only"
import { after } from "next/server"
import { Resend } from "resend"
import { armarHtml, type Aviso } from "./plantilla"

// Avisos internos de VibrancyGG: alguien quiere entrar, alguien quiere crecer,
// alguien quiere irse. No son correos al cliente — el destinatario somos
// nosotros — así que van en español y sin marca del negocio.
//
// Regla de oro de este archivo: AVISAR NUNCA PUEDE ROMPER LA ACCIÓN. Si Resend
// está caído o falta la llave, la solicitud del dueño igual se guarda. Por eso
// todo está envuelto y nada se relanza.

const DESTINO = process.env.ADMIN_NOTICE_EMAIL || "ggvibrancy@gmail.com"
const REMITENTE = "FoodTruckOS <avisos@mail.vibrancygg.com>"

async function enviar(aviso: Aviso): Promise<void> {
  const llave = process.env.RESEND_API_KEY
  // Sin llave no se avisa y no se rompe nada: es lo que pasa en desarrollo y
  // en las vistas previas, donde no queremos mandar correo de verdad.
  if (!llave) return

  try {
    const resend = new Resend(llave)
    const { error } = await resend.emails.send({
      from: REMITENTE,
      to: DESTINO,
      subject: aviso.asunto,
      html: armarHtml(aviso, process.env.NEXT_PUBLIC_SITE_URL || "https://foodtruckos.com"),
    })
    if (error) {
      console.error("[avisoAdmin] Resend rechazó el envío:", error)
    }
  } catch (e) {
    console.error("[avisoAdmin] no se pudo avisar:", e)
  }
}

/** Manda el aviso DESPUÉS de responderle al dueño, no antes: su solicitud ya
 *  quedó guardada y no tiene por qué esperar a que salga un correo nuestro.
 *  Va aquí adentro y no en cada llamador para que nadie tenga que acordarse. */
export function avisarAdmin(aviso: Aviso): void {
  after(() => enviar(aviso))
}
