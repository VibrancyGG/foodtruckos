import "server-only"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export const getAdminContext = cache(async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, isAdmin: false } as const

  const { data: isAdmin } = await supabase.rpc("is_platform_admin")

  return { user, isAdmin: !!isAdmin } as const
})
