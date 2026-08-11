import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { AuthShell } from "@/components/auth/AuthShell"
import { RegisterForm } from "@/components/auth/RegisterForm"

export default async function RegistroPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect("/panel")

  return (
    <LangProvider defaultLang="es">
      <AuthShell>
        <RegisterForm />
      </AuthShell>
    </LangProvider>
  )
}
