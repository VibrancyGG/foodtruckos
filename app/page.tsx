import type { Metadata } from "next"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { LandingPage } from "@/components/landing/LandingPage"

export const metadata: Metadata = {
  title: "Pavessa — Digital ordering for food trucks",
  description:
    "Live kitchen screen, QR ordering, zero commission. The software food trucks actually need.",
}

export default function Home() {
  return (
    <LangProvider defaultLang="es">
      <LandingPage />
    </LangProvider>
  )
}
