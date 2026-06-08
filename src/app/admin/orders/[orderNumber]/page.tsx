export const dynamic = "force-dynamic";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import AdminLoginPage from "../../AdminLoginPage";
import AdminOrderDetail from "./AdminOrderDetail";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) return <AdminLoginPage />;
  const { orderNumber } = await params;
  return <AdminOrderDetail orderNumber={orderNumber} />;
}
