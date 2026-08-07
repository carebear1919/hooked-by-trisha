import { Suspense } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import FlashToast from "@/components/admin/FlashToast";
import { getPayloadClient, lexicalToText } from "@/lib/payload";
import { updateSiteSettings } from "../actions";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const payload = await getPayloadClient();
  const [settings, { docs: categories }, { docs: mediaOptions }] = await Promise.all([
    payload.findGlobal({ slug: "site-settings", depth: 1 }),
    payload.find({ collection: "categories", sort: "name", limit: 100 }),
    payload.find({ collection: "media", sort: "-createdAt", limit: 100 }),
  ]);

  return (
    <>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <AdminTopbar
        title="Site Settings"
        actions={
          <button
            type="submit"
            form="settings-form"
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-body text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            Save Changes
          </button>
        }
      />
      <SettingsForm
        action={updateSiteSettings}
        settings={settings}
        categories={categories as unknown as { id: number | string; name: string }[]}
        mediaOptions={mediaOptions}
        returnPolicyText={lexicalToText(settings.returnPolicy)}
      />
    </>
  );
}
