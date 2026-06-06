export const dynamic = "force-dynamic";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import AdminLoginPage           from "./AdminLoginPage";
import AdminDashboard           from "./AdminDashboard";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) return <AdminLoginPage />;
  return <AdminDashboard />;
}
