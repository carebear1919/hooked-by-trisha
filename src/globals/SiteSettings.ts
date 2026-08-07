import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    read: () => true,
  },
  fields: [
    { name: "shopName", type: "text", defaultValue: "Hooked by Trisha" },
    { name: "logo", type: "upload", relationTo: "media" },
    {
      name: "payment",
      type: "group",
      fields: [
        { name: "gcashNumber", type: "text" },
        { name: "gcashQrCode", type: "upload", relationTo: "media" },
        { name: "bpiAccountName", type: "text" },
        { name: "bpiAccountNumber", type: "text" },
      ],
    },
    {
      name: "shipping",
      type: "group",
      fields: [
        { name: "standardFee", type: "number", defaultValue: 150 },
        { name: "freeShippingThreshold", type: "number" },
        { name: "pickupLocation", type: "text" },
      ],
    },
    {
      name: "social",
      type: "group",
      fields: [
        {
          name: "showSocialLinks",
          type: "checkbox",
          defaultValue: true,
          label: "Show social links in the footer",
        },
        { name: "instagram", type: "text" },
        { name: "showInstagram", type: "checkbox", defaultValue: true },
        { name: "facebook", type: "text" },
        { name: "showFacebook", type: "checkbox", defaultValue: true },
        { name: "tiktok", type: "text" },
        { name: "showTiktok", type: "checkbox", defaultValue: true },
      ],
    },
    { name: "contactEmail", type: "email" },
    { name: "notificationEmail", type: "email" },
    { name: "returnPolicy", type: "richText" },
    {
      name: "promotions",
      type: "group",
      fields: [
        {
          name: "saleBannerEnabled",
          type: "checkbox",
          defaultValue: true,
          label: "Show sale banner on homepage",
        },
        {
          name: "discountPercent",
          type: "number",
          min: 1,
          max: 100,
          defaultValue: 20,
          label: "Discount percentage",
        },
        {
          name: "category",
          type: "relationship",
          relationTo: "categories",
          label: "Applies to category (optional — links the banner to /shop if left blank)",
        },
        {
          name: "headline",
          type: "text",
          label: "Headline (optional override)",
          admin: {
            description:
              'Leave blank to auto-generate, e.g. "Up to 20% off Amigurumi".',
          },
        },
        {
          name: "subtext",
          type: "textarea",
          label: "Supporting text (optional override)",
        },
      ],
    },
    {
      name: "notifications",
      type: "group",
      fields: [
        { name: "newOrder", type: "checkbox", defaultValue: true },
        { name: "paymentConfirmed", type: "checkbox", defaultValue: true },
        { name: "paymentFailed", type: "checkbox", defaultValue: true },
        { name: "contactForm", type: "checkbox", defaultValue: true },
        { name: "lowStock", type: "checkbox", defaultValue: true },
      ],
    },
  ],
};
