import type { Block, CollectionConfig } from "payload";

const Hero: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Heroes" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "textarea" },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "buttonLabel", type: "text" },
    { name: "buttonHref", type: "text" },
  ],
};

const ImageText: Block = {
  slug: "imageText",
  labels: { singular: "Image + Text", plural: "Image + Text Blocks" },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "heading", type: "text" },
    { name: "text", type: "richText" },
    {
      name: "imagePosition",
      type: "select",
      defaultValue: "left",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
  ],
};

const Gallery: Block = {
  slug: "gallery",
  labels: { singular: "Gallery", plural: "Galleries" },
  fields: [
    {
      name: "images",
      type: "array",
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true }],
    },
  ],
};

const Testimonial: Block = {
  slug: "testimonial",
  labels: { singular: "Testimonial", plural: "Testimonials" },
  fields: [
    { name: "quote", type: "textarea", required: true },
    { name: "attribution", type: "text" },
  ],
};

const FAQ: Block = {
  slug: "faq",
  labels: { singular: "FAQ", plural: "FAQ Blocks" },
  fields: [
    {
      name: "questions",
      type: "array",
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
  ],
};

const RichTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Rich Text", plural: "Rich Text Blocks" },
  fields: [{ name: "content", type: "richText" }],
};

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      name: "layout",
      type: "blocks",
      blocks: [Hero, ImageText, Gallery, Testimonial, FAQ, RichTextBlock],
    },
  ],
};
