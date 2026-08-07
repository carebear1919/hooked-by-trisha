import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { MAGIC_LINK_DURATION_SECONDS, MAGIC_LINK_SECRET } from "./auth-config";

const encodedSecret = new TextEncoder().encode(MAGIC_LINK_SECRET);

export async function signMagicLinkToken(email: string): Promise<string> {
  return new SignJWT({ email, purpose: "admin-login" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAGIC_LINK_DURATION_SECONDS}s`)
    .sign(encodedSecret);
}

export async function verifyMagicLinkToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret, { algorithms: ["HS256"] });
    if (payload.purpose !== "admin-login" || typeof payload.email !== "string") {
      return null;
    }
    return payload.email;
  } catch {
    return null;
  }
}
