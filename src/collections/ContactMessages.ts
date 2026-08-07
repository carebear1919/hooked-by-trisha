import type { CollectionConfig } from "payload";

export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "createdAt"],
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "message", type: "textarea", required: true },
  ],
};
