import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "filename",
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: "media",
    // No imageSizes: sharp's async resize-variant generation was the actual
    // source of the "SharedArrayBuffer is not allowed" upload crash on
    // Vercel — those buffers are produced entirely inside Payload/sharp,
    // outside anything our own upload code touches, so no buffer-copy fix
    // on our end could reach them. Every consumer already falls back to
    // the full-size url when thumbnailURL is absent.
    mimeTypes: ["image/*"],
    // In production we upload to Vercel Blob ourselves (see
    // lib/media-upload.ts) and hand Payload the resulting metadata instead
    // of raw file bytes, so it never re-processes the file itself.
    filesRequiredOnCreate: false,
    // Without a stored focalX/focalY, Payload's default focalPoint feature
    // treats every create as a focal-point change vs. the (missing) current
    // value, which makes it re-fetch our blob's own URL and re-upload it
    // under the same filename — colliding with the blob we already wrote.
    focalPoint: false,
  },
  fields: [
    {
      name: "title",
      type: "text",
      admin: { description: "Friendly name shown in the Media Library — helps you find it later." },
    },
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
    },
  ],
};
