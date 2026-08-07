import type { CollectionConfig } from "payload";

export const NotificationLog: CollectionConfig = {
  slug: "notification-log",
  admin: {
    useAsTitle: "eventType",
    defaultColumns: ["eventType", "recipient", "sentStatus", "createdAt"],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: "eventType",
      type: "select",
      required: true,
      options: [
        { label: "New Order", value: "new-order" },
        { label: "Payment Confirmed", value: "payment-confirmed" },
        { label: "Payment Failed", value: "payment-failed" },
        { label: "Contact Form Submitted", value: "contact-form" },
        { label: "Low Stock Alert", value: "low-stock" },
      ],
    },
    { name: "recipient", type: "email", required: true },
    { name: "message", type: "text" },
    { name: "link", type: "text" },
    { name: "read", type: "checkbox", defaultValue: false },
    {
      name: "sentStatus",
      type: "select",
      defaultValue: "sent",
      options: [
        { label: "Sent", value: "sent" },
        { label: "Failed", value: "failed" },
      ],
    },
  ],
};
