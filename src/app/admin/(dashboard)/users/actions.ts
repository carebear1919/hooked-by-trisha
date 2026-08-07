"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPayloadClient } from "@/lib/payload";

export async function createUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "editor");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/users?error=Email and password are required.");
  }

  const payload = await getPayloadClient();
  await payload.create({
    collection: "users",
    data: { name: name || undefined, email, role, password },
  });

  revalidatePath("/admin/users");
  redirect(`/admin/users?flash=Invited ${email} to the CMS admin.`);
}
