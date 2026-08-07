import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAdminSession } from "@/lib/session";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen w-full bg-surface-container-low">
      <AdminSidebar email={session.email} />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
