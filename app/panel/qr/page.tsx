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
      <h1 className="mb-1 text-2xl font-black">Códigos QR</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Uno por truck. Imprímelo y pégalo donde el comensal lo vea al hacer fila.
      </p>
      <QrScreen codes={codes} />
    </div>
  )
}
