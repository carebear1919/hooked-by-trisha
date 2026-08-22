import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAdminSession } from "@/lib/session";
import { getPayloadClient } from "@/lib/payload";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({ slug: "site-settings" });
  const shopName = settings.shopName || "Handmade Crochet Co.";

  return (
    <div className="flex min-h-screen w-full bg-surface-container-low">
      <AdminSidebar email={session.email} shopName={shopName} />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
