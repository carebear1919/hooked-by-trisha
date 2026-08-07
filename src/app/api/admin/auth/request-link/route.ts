import { NextRequest, NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/lib/auth-config";
import { signMagicLinkToken } from "@/lib/magic-link";
import { sendMagicLinkEmail } from "@/lib/mailer";
import { isRateLimited } from "@/lib/rate-limit";

const MAX_REQUESTS = 3;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`magic-link:${ip}`, MAX_REQUESTS, WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // Only ever send a link (or reveal anything) if it matches the one allowed admin email.
  if (ADMIN_EMAIL && email === ADMIN_EMAIL) {
    const token = await signMagicLinkToken(email);
    const verifyUrl = new URL("/api/admin/auth/verify", request.url);
    verifyUrl.searchParams.set("token", token);
    await sendMagicLinkEmail(email, verifyUrl.toString());
  }

  // Always return the same generic response so we don't leak which email is valid.
  return NextResponse.json({ ok: true });
}
