import "server-only";

import { put } from "@vercel/blob";
import { getPayloadClient } from "./payload";
import { toUploadBuffer } from "./safe-buffer";

// Vercel's Functions runtime (a custom Rust-based Node.js-compatible host,
// not stock Node — visible in stack traces as /opt/rust/nodejs.js) rejects
// any Buffer whose backing memory crosses into its fetch() as a
// SharedArrayBuffer, regardless of how "clean" the buffer is on the JS side.
// This happens somewhere inside Payload's own file-handling pipeline before
// the storage adapter's handleUpload ever sees it — no buffer-copy fix in
// our own code could reach it. Calling @vercel/blob's put() ourselves,
// completely bypassing Payload's internal file processing, sidesteps
// whatever Payload does internally that triggers it. Locally (no
// BLOB_READ_WRITE_TOKEN), we fall back to Payload's normal local-disk
// upload flow, where none of this applies.
export async function createMediaDoc({
  file,
  title,
  alt,
  description,
}: {
  file: File;
  title: string;
  alt: string;
  description: string;
}) {
  const payload = await getPayloadClient();
  const buffer = await toUploadBuffer(file);
  const mimetype = file.type || "application/octet-stream";

  const blobToken = process.env.BLOB2_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

  if (blobToken) {
    const blob = await put(file.name, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: mimetype,
      token: blobToken,
    });

    return payload.create({
      collection: "media",
      data: {
        title,
        alt,
        description,
        filename: blob.pathname,
        mimeType: mimetype,
        filesize: buffer.length,
        url: blob.url,
        // Payload always defaults focal point to {x:50,y:50} on create and
        // compares it against the doc's (missing) focalX/focalY, treating the
        // mismatch as a focal-point change — which re-fetches this same URL
        // and re-uploads it under the same filename, colliding with the blob
        // we just wrote above. Setting these to match avoids that re-upload.
        focalX: 50,
        focalY: 50,
      },
    });
  }

  return payload.create({
    collection: "media",
    data: { title, alt, description },
    file: {
      data: buffer,
      mimetype,
      name: file.name,
      size: buffer.length,
    },
  });
}
