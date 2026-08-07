import { getPayloadClient } from "@/lib/payload";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({ slug: "site-settings" });

  return <AdminLoginForm supportEmail={settings.contactEmail || "support@hookedbytrisha.com"} />;
}
