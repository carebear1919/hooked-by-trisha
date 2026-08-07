import { NextRequest, NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/lib/auth-config";
import { verifyMagicLinkToken } from "@/lib/magic-link";
import { createAdminSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const email = token ? await verifyMagicLinkToken(token) : null;

  if (!email || (ADMIN_EMAIL && email !== ADMIN_EMAIL)) {
    return NextResponse.redirect(new URL("/admin/login?error=expired", request.url));
  }

  await createAdminSession(email);
  return NextResponse.redirect(new URL("/admin", request.url));
}
