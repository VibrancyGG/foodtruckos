"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { resolvePostLoginDestination } from "@/lib/auth/postLoginDestination"

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function getPostLoginRedirect() {
  return resolvePostLoginDestination()
}
