// Plantilla de los avisos internos. Va aparte del envío a propósito: es una
// función pura, sin dependencias de servidor, así que se puede armar y revisar
// el correo sin mandarlo.

export type Aviso = {
  asunto: string
  titulo: string
  /** Pares etiqueta/valor que se pintan como tabla. */
  datos: [string, string][]
  /** Lo que escribió la persona, si escribió algo. */
  nota?: string | null
  /** A dónde va el admin a resolverlo. */
  destino?: string
}

function escapar(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function armarHtml(aviso: Aviso, base: string): string {
  const filas = aviso.datos
    .filter(([, valor]) => valor && valor.trim())
    .map(
      ([etiqueta, valor]) =>
        `<tr>
           <td style="padding:6px 16px 6px 0;color:#6b6b6b;font-size:14px;white-space:nowrap;vertical-align:top">${escapar(etiqueta)}</td>
           <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a">${escapar(valor)}</td>
         </tr>`,
    )
    .join("")

  const nota = aviso.nota?.trim()
    ? `<div style="margin-top:20px;padding:14px 16px;background:#f5f4f1;border-radius:10px">
         <div style="font-size:12px;color:#6b6b6b;margin-bottom:5px">Lo que escribió</div>
         <div style="font-size:14px;color:#1a1a1a;white-space:pre-wrap">${escapar(aviso.nota.trim())}</div>
       </div>`
    : ""

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:28px 24px;color:#1a1a1a">
  <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#b4670a;font-weight:700;margin-bottom:14px">Pavessa</div>
  <h1 style="font-size:21px;margin:0 0 20px;line-height:1.3">${escapar(aviso.titulo)}</h1>
  <table style="border-collapse:collapse;width:100%">${filas}</table>
  ${nota}
  <a href="${base}${aviso.destino || "/admin"}" style="display:inline-block;margin-top:24px;background:#1a1a1a;color:#fff;text-decoration:none;padding:11px 20px;border-radius:9px;font-size:14px;font-weight:600">Abrir el panel</a>
</div>`
}
