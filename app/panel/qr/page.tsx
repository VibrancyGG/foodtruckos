import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { getOwnerQrCodes } from "@/lib/qr/getOwnerQrCodes"
import { QrScreen } from "@/components/panel/QrScreen"

export default async function PanelQrPage() {
  const { businessId } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const codes = await getOwnerQrCodes(businessId)

  return (
    <div className="mx-auto max-w-3xl">
      <QrScreen codes={codes} />
    </div>
  )
}
