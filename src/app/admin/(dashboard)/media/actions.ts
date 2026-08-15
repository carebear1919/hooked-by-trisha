"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPayloadClient } from "@/lib/payload";
import { createMediaDoc } from "@/lib/media-upload";

export async function uploadMedia(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image to upload.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim() || title || file.name;
  const description = String(formData.get("description") ?? "").trim();

  try {
    await createMediaDoc({ file, title, alt, description });
  } catch (err) {
    console.error("[uploadMedia] failed:", {
      name: (err as Error)?.name,
      message: (err as Error)?.message,
      stack: (err as Error)?.stack,
    });
    throw err;
  }

  revalidatePath("/admin/media");
  redirect("/admin/media?flash=Image uploaded");
}

export async function deleteMedia(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const payload = await getPayloadClient();
  await payload.delete({ collection: "media", id });

  revalidatePath("/admin/media");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/pages");
  redirect("/admin/media?flash=Image deleted");
}
