import { LangProvider } from "@/lib/i18n/LangProvider"
import { AuthShell } from "@/components/auth/AuthShell"
import { RecoverForm } from "@/components/auth/RecoverForm"

export default function RecuperarPage() {
  return (
    <LangProvider defaultLang="es">
      <AuthShell>
        <RecoverForm />
      </AuthShell>
    </LangProvider>
  )
}
