import { LangProvider } from "@/lib/i18n/LangProvider"
import { AuthShell } from "@/components/auth/AuthShell"
import { NewPasswordForm } from "@/components/auth/NewPasswordForm"

export default function ResetPasswordPage() {
  return (
    <LangProvider defaultLang="es">
      <AuthShell>
        <NewPasswordForm />
      </AuthShell>
    </LangProvider>
  )
}
