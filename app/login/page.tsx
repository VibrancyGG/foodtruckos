import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { AuthShell } from "@/components/auth/AuthShell"
import { LoginForm } from "@/components/auth/LoginForm"

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect("/panel")

  return (
    <LangProvider defaultLang="es">
      <AuthShell>
        <LoginForm />
      </AuthShell>
    </LangProvider>
  )
}
