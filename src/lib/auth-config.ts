import "server-only";

function getSecret(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value) return value;
  console.warn(
    `[auth] ${name} not set — using an insecure fallback. Set a real value in .env.local (or your host's env vars) before real deployment: openssl rand -base64 32`
  );
  return devFallback;
}

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

export const SESSION_SECRET = getSecret("AUTH_SECRET", "dev-only-insecure-session-secret");
export const MAGIC_LINK_SECRET = getSecret(
  "MAGIC_LINK_SECRET",
  "dev-only-insecure-magic-link-secret"
);

export const SESSION_COOKIE = "admin_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const MAGIC_LINK_DURATION_SECONDS = 60 * 15; // 15 minutes
