import { notFound } from "next/navigation"
import { getOrderWithItems } from "@/lib/orders/getOrder"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { TrackingClient } from "@/components/tracking/TrackingClient"

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const initial = await getOrderWithItems(orderId)

  if (!initial) notFound()

  return (
    <LangProvider defaultLang="es">
      <TrackingClient initial={initial} />
    </LangProvider>
  )
}
