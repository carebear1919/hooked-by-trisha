import { Suspense } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import NotificationHighlight from "@/components/admin/NotificationHighlight";
import { getPayloadClient } from "@/lib/payload";

export default async function MessagesPage() {
  const payload = await getPayloadClient();
  const { docs: messages } = await payload.find({
    collection: "contact-messages",
    sort: "-createdAt",
    limit: 100,
  });

  return (
    <>
      <Suspense fallback={null}>
        <NotificationHighlight />
      </Suspense>
      <AdminTopbar title="Messages" />
      <div className="p-6 md:p-8 space-y-4 max-w-[900px]">
        {messages.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant p-16 flex flex-col items-center justify-center text-center gap-3">
            <span aria-hidden className="material-symbols-outlined text-4xl text-outline">
              forum
            </span>
            <p className="font-headline text-headline-sm text-on-surface">No messages yet</p>
            <p className="font-body text-body-md text-on-surface-variant max-w-sm">
              Messages submitted through the storefront contact form will show up here.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            data-highlight-target={`message-${m.id}`}
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-body text-body-lg font-bold text-on-surface">{m.name}</p>
                <p className="font-body text-label-md text-on-surface-variant">{m.email}</p>
              </div>
              <p className="font-body text-label-md text-on-surface-variant shrink-0">
                {new Date(m.createdAt).toLocaleString("en-PH")}
              </p>
            </div>
            <p className="font-body text-body-md text-on-surface whitespace-pre-line mb-4">{m.message}</p>
            <a
              href={`mailto:${m.email}`}
              className="inline-flex items-center gap-2 text-primary font-body text-label-md hover:underline"
            >
              <span aria-hidden className="material-symbols-outlined text-[18px]">
                reply
              </span>
              Reply by Email
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
