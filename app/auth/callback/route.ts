import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { resolvePostLoginDestination } from "@/lib/auth/postLoginDestination"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${await resolvePostLoginDestination()}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
