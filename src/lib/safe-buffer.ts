import "server-only";

// Node's Buffer.from()/allocUnsafe() can allocate small buffers from an
// internal shared pool that, on current Node versions, is backed by a
// SharedArrayBuffer. The Vercel Blob storage adapter passes that buffer into
// fetch() internally, which throws "SharedArrayBuffer is not allowed" per
// the Fetch spec. Buffer.allocUnsafeSlow() always allocates its own
// non-pooled memory, guaranteeing it's never shared.
export async function toUploadBuffer(file: File): Promise<Buffer> {
  const source = Buffer.from(await file.arrayBuffer());
  const buffer = Buffer.allocUnsafeSlow(source.length);
  source.copy(buffer);
  return buffer;
}
