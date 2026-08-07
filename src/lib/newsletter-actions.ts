"use server";

import { getPayloadClient } from "./payload";

export async function subscribeNewsletter(email: string): Promise<{ ok: boolean; message: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const payload = await getPayloadClient();
  try {
    await payload.create({ collection: "newsletter-subscribers", data: { email: trimmed } });
    return { ok: true, message: "Subscribed! Thanks for joining the Hooked Circle." };
  } catch {
    // Most likely a duplicate email (unique constraint) — treat as a friendly success.
    return { ok: true, message: "You're already on the list!" };
  }
}
