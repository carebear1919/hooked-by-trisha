import { Suspense } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import FlashToast from "@/components/admin/FlashToast";
import { getPayloadClient } from "@/lib/payload";
import { updateNotificationToggles } from "../actions";

const EVENTS = [
  {
    name: "newOrder",
    icon: "shopping_cart",
    title: "New Order Placed",
    desc: "Send an alert immediately when a customer completes a purchase.",
    tone: "primary",
  },
  {
    name: "paymentConfirmed",
    icon: "verified",
    title: "Payment Confirmed",
    desc: "Notify when transaction verification is successful and funds are held.",
    tone: "primary",
  },
  {
    name: "paymentFailed",
    icon: "error_outline",
    title: "Payment Failed",
    desc: "Alert for declined payments or processing errors to allow for manual follow-up.",
    tone: "error",
  },
  {
    name: "contactForm",
    icon: "forum",
    title: "Contact Form Submitted",
    desc: "Relay messages from the contact page directly to your inbox.",
    tone: "primary",
  },
  {
    name: "lowStock",
    icon: "inventory_2",
    title: "Low Stock Alert",
    desc: "Notify when product inventory falls below 5 units.",
    tone: "tertiary",
  },
] as const;

export default async function NotificationsSettingsPage() {
  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({ slug: "site-settings" });
  const notifications = settings.notifications ?? {};

  return (
    <>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <AdminTopbar title="Notifications" />
      <form action={updateNotificationToggles} className="p-6 md:p-8 max-w-[900px] mx-auto w-full space-y-10">
        <section>
          <h3 className="font-headline text-headline-sm text-on-surface mb-2">Notification Email</h3>
          <p className="text-on-surface-variant font-body text-body-md mb-4">
            Configure where administrative alerts are sent.
          </p>
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row items-end gap-6">
            <div className="grow w-full">
              <label className="block font-body text-label-md text-on-surface-variant uppercase tracking-widest mb-2">
                Recipient Email Address
              </label>
              <input
                type="email"
                name="notificationEmail"
                defaultValue={settings.notificationEmail ?? ""}
                className="w-full bg-surface-container-low border-none border-b-2 border-primary/20 rounded-t-lg px-4 py-3 focus:ring-0 focus:border-primary font-body transition-colors"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-headline text-headline-sm text-on-surface mb-6">Event Triggers</h3>
          <div className="space-y-4">
            {EVENTS.map((event) => {
              const on = notifications[event.name as keyof typeof notifications] ?? true;
              return (
                <label
                  key={event.name}
                  className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        event.tone === "error"
                          ? "bg-error-container/30 text-error"
                          : event.tone === "tertiary"
                            ? "bg-tertiary-fixed text-tertiary"
                            : "bg-secondary-fixed text-primary"
                      }`}
                    >
                      <span aria-hidden className="material-symbols-outlined text-[24px]">
                        {event.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-body text-body-lg font-bold text-on-surface">{event.title}</h4>
                      <p className="text-on-surface-variant text-[14px]">{event.desc}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    name={event.name}
                    defaultChecked={on}
                    className="h-6 w-11 accent-primary"
                  />
                </label>
              );
            })}
          </div>
          <div className="mt-10 flex justify-end gap-4">
            <button
              type="submit"
              className="px-12 py-3 rounded-full font-body text-label-md bg-primary text-on-primary shadow-md hover:opacity-90 transition-all"
            >
              Save Preferences
            </button>
          </div>
        </section>
      </form>
    </>
  );
}
