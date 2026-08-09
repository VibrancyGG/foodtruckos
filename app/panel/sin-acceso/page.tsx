import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyPendingBusinessSignupRequest } from "@/lib/business/signupRequests"
import { SinAccesoScreen } from "@/components/panel/SinAccesoScreen"

export default async function SinAccesoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const pendingRequest = await getMyPendingBusinessSignupRequest()

  return <SinAccesoScreen pendingRequest={pendingRequest} />
}
