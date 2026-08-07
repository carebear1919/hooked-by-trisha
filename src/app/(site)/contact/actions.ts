"use server";

import { getPayloadClient } from "@/lib/payload";
import { notifyContactForm } from "@/lib/notify";

export async function submitContactForm(input: { name: string; email: string; message: string }) {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name || !email || !message) {
    throw new Error("All fields are required.");
  }

  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: "contact-messages",
    data: { name, email, message },
  });

  await notifyContactForm({ id: doc.id, name, email, message });
}
