import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "price", "stock", "status"],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    { name: "description", type: "richText" },
    { name: "materialsCare", type: "textarea" },
    { name: "shippingReturns", type: "textarea" },
    { name: "price", type: "number", required: true, min: 0, admin: { position: "sidebar" } },
    { name: "compareAtPrice", type: "number", min: 0, admin: { position: "sidebar" } },
    {
      name: "photos",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
    { name: "stock", type: "number", required: true, defaultValue: 0, admin: { position: "sidebar" } },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "featured", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
  ],
};
