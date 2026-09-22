import { LangProvider } from "@/lib/i18n/LangProvider"
import { AuthShell } from "@/components/auth/AuthShell"
import { ConfirmEmail } from "@/components/auth/ConfirmEmail"

// Destino de los enlaces de correo (confirmar cuenta y enlace para entrar).
//
// Valida con token_hash y no con PKCE: PKCE solo sirve en el mismo navegador
// donde se pidió el enlace, y quien llena el formulario en la computadora y
// abre el correo en el celular veía "No pudimos validar ese enlace".
//
// Y NO canjea el token al cargar la página, a propósito: la app de Gmail y
// algunos navegadores abren el enlace una vez por su cuenta antes que la
// persona (comprobado el 22/09/2026: dos aperturas en 300 ms). Si el servidor
// lo gastara en ese primer GET, a la persona le llegaba ya usado. Se canjea
// desde el navegador, cuando la página de verdad corrió ahí.
//
// Las plantillas de correo de Supabase apuntan aquí:
//   https://pavessa.com/auth/confirm?token_hash={{ .TokenHash }}&type=email
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>
}) {
  const { token_hash, type } = await searchParams

  return (
    <LangProvider defaultLang="es">
      <AuthShell>
        <ConfirmEmail tokenHash={token_hash ?? ""} type={type ?? "email"} />
      </AuthShell>
    </LangProvider>
  )
}
