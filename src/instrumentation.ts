export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Node's Buffer.from()/allocUnsafe() slice small allocations from an
    // internal shared pool that, on current Node versions, is backed by a
    // SharedArrayBuffer. Payload generates resized image variants (via sharp)
    // for Media uploads, and those buffers — not ones we construct ourselves —
    // are what the Vercel Blob upload's fetch() rejects with "SharedArrayBuffer
    // is not allowed". Setting poolSize to 0 disables pooling process-wide, so
    // every Buffer allocation anywhere in the dependency chain gets its own
    // guaranteed-non-shared memory.
    Buffer.poolSize = 0;
  }
}
