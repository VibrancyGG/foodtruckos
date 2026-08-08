import { getAdminOverview } from "@/lib/admin/getAdminOverview"
import { AdminOverviewScreen } from "@/components/admin/AdminOverviewScreen"

export default async function AdminPage() {
  const overview = await getAdminOverview()
  return <AdminOverviewScreen {...overview} />
}
