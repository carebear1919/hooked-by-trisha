import type { CollectionConfig } from "payload";

export const NewsletterSubscribers: CollectionConfig = {
  slug: "newsletter-subscribers",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "createdAt"],
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [{ name: "email", type: "email", required: true, unique: true }],
};
