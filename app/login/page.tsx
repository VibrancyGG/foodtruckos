import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/auth/LoginForm"

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect("/panel")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 px-6 text-white">
      <h1 className="text-xl font-black">FoodTruckOS</h1>
      <LoginForm />
    </div>
  )
}
