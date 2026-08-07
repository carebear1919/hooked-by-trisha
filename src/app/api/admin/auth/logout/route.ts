import { NextRequest, NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  await destroyAdminSession();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
