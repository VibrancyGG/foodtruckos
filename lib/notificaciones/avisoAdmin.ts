import "server-only"
import { after } from "next/server"
import { Resend } from "resend"
import { armarHtml, type Aviso } from "./plantilla"
import { SITE_URL } from "@/lib/utils/siteUrl"
import { CORREO_CONTACTO } from "@/lib/utils/contacto"

// Avisos internos de VibrancyGG: alguien quiere entrar, alguien quiere crecer,
// alguien quiere irse. No son correos al cliente — el destinatario somos
// nosotros — así que van en español y sin marca del negocio.
//
// Regla de oro de este archivo: AVISAR NUNCA PUEDE ROMPER LA ACCIÓN. Si Resend
// está caído o falta la llave, la solicitud del dueño igual se guarda. Por eso
// todo está envuelto y nada se relanza.

const DESTINO = process.env.ADMIN_NOTICE_EMAIL || CORREO_CONTACTO

// El remitente NO puede ser la cuenta de Gmail de Pavessa, por mucho que sea
// la dirección oficial del producto. Resend —como cualquier servicio de correo
// transaccional— solo deja enviar desde un dominio verificado con registros
// DNS, y gmail.com no se puede verificar: no es nuestro, y su política DMARC
// hace que los buzones rechacen cualquier correo que diga venir de ahí sin
// venir de Google. Poner ftspavessa@gmail.com aquí no daría error al guardar:
// simplemente los avisos dejarían de llegar.
//
// Sale de mail.pavessa.com (verificado en Resend el 21/09/2026, cuenta
// jetgosolutions) para que remitente, marca y enlaces sean del mismo dominio:
// cuando salía de mail.vibrancygg.com firmando como "Pavessa" y enlazando a
// pavessa.com, Gmail lo mandaba a spam.
//
// Las respuestas sí van a la Gmail oficial vía Reply-To, que es lo único que
// Resend permite hacer con una dirección que no es de un dominio verificado.
const REMITENTE = "Pavessa <avisos@mail.pavessa.com>"
const RESPONDER_A = CORREO_CONTACTO

/** Envía un aviso de prueba y DEVUELVE lo que dijo Resend, en vez de tragarse
 *  el error como hace el envío normal.
 *
 *  Existe porque los avisos reales fallaban en silencio: el único rastro era un
 *  console.error en los registros de Vercel, que en el plan gratuito se borran
 *  a la hora. Llegaban dos solicitudes de negocio y no había forma de saber si
 *  el correo no salió, rebotó o se perdió. Esto corre en el mismo entorno, con
 *  la misma llave, remitente y destino que un aviso de verdad — si esto llega,
 *  los avisos reales también. */
export async function probarAviso(): Promise<
  { ok: true; id: string; destino: string } | { ok: false; error: string }
> {
  const llave = process.env.RESEND_API_KEY
  if (!llave) return { ok: false, error: "En este entorno no está configurada RESEND_API_KEY" }
  try {
    const resend = new Resend(llave)
    const { data, error } = await resend.emails.send({
      from: REMITENTE,
      replyTo: RESPONDER_A,
      to: DESTINO,
      subject: "Prueba de avisos de Pavessa",
      html: armarHtml(
        {
          asunto: "Prueba de avisos de Pavessa",
          titulo: "Si lees esto, los avisos funcionan",
          datos: [["Enviado", new Date().toISOString()]],
          nota: "Es una prueba lanzada desde el panel de admin.",
          destino: "/admin",
        },
        SITE_URL,
      ),
    })
    if (error) return { ok: false, error: `${error.name}: ${error.message}` }
    return { ok: true, id: data?.id ?? "", destino: DESTINO }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

async function enviar(aviso: Aviso): Promise<void> {
  const llave = process.env.RESEND_API_KEY
  // Sin llave no se avisa y no se rompe nada: es lo que pasa en desarrollo y
  // en las vistas previas, donde no queremos mandar correo de verdad.
  if (!llave) return

  try {
    const resend = new Resend(llave)
    const { error } = await resend.emails.send({
      from: REMITENTE,
      replyTo: RESPONDER_A,
      to: DESTINO,
      subject: aviso.asunto,
      html: armarHtml(aviso, SITE_URL),
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
