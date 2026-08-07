import "server-only";

// In-memory sliding-window limiter. Good enough for a single long-running
// Node process; if this ever runs across multiple serverless instances,
// swap the Map for a shared store (Redis, Postgres) keyed the same way.
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  hits.set(key, timestamps);
  return timestamps.length > max;
}
