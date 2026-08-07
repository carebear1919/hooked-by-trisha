"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPayloadClient, textToLexical } from "@/lib/payload";
import { notifyPaymentConfirmed } from "@/lib/notify";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uploadNewPhotos(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  formData: FormData,
  titleFallback: string,
  fieldName = "newPhotos"
): Promise<(number | string)[]> {
  const files = formData.getAll(fieldName).filter((f): f is File => f instanceof File && f.size > 0);

  const uploaded = await Promise.all(
    files.map(async (file) => {
      // See media/actions.ts uploadMedia — .slice(0) forces a real copy so the
      // Blob upload's internal fetch() never sees a SharedArrayBuffer-backed buffer.
      const buffer = Buffer.from((await file.arrayBuffer()).slice(0));
      const doc = await payload.create({
        collection: "media",
        data: { title: titleFallback, alt: titleFallback },
        file: {
          data: buffer,
          mimetype: file.type || "application/octet-stream",
          name: file.name,
          size: buffer.length,
        },
      });
      return doc.id;
    })
  );

  return uploaded;
}

export async function createProduct(formData: FormData) {
  const payload = await getPayloadClient();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const materialsCare = String(formData.get("materialsCare") ?? "");
  const shippingReturns = String(formData.get("shippingReturns") ?? "");
  const price = Number(formData.get("price") ?? 0);
  const compareAtPrice = formData.get("compareAtPrice")
    ? Number(formData.get("compareAtPrice"))
    : undefined;
  const stock = Number(formData.get("stock") ?? 0);
  const category = Number(formData.get("category") ?? 0);
  const status = String(formData.get("status") ?? "draft") as "draft" | "published";
  const featured = formData.get("featured") === "on";
  const existingPhotos = formData.getAll("photos").map((v) => Number(v));

  if (!name || !category) {
    throw new Error("Name and category are required.");
  }

  const newPhotoIds = await uploadNewPhotos(payload, formData, name);
  const photos = [...existingPhotos, ...newPhotoIds];

  await payload.create({
    collection: "products",
    data: {
      name,
      slug: slugify(name),
      description: textToLexical(description),
      materialsCare,
      shippingReturns,
      price,
      compareAtPrice,
      stock,
      category,
      status,
      featured,
      photos,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/(site)/shop/[category]", "page");
  redirect("/admin/products?flash=Product created");
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id.");

  const payload = await getPayloadClient();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const materialsCare = String(formData.get("materialsCare") ?? "");
  const shippingReturns = String(formData.get("shippingReturns") ?? "");
  const price = Number(formData.get("price") ?? 0);
  const compareAtPrice = formData.get("compareAtPrice")
    ? Number(formData.get("compareAtPrice"))
    : undefined;
  const stock = Number(formData.get("stock") ?? 0);
  const category = Number(formData.get("category") ?? 0);
  const status = String(formData.get("status") ?? "draft") as "draft" | "published";
  const featured = formData.get("featured") === "on";
  const existingPhotos = formData.getAll("photos").map((v) => Number(v));
  const newPhotoIds = await uploadNewPhotos(payload, formData, name);
  const photos = [...existingPhotos, ...newPhotoIds];

  await payload.update({
    collection: "products",
    id,
    data: {
      name,
      description: textToLexical(description),
      materialsCare,
      shippingReturns,
      price,
      compareAtPrice,
      stock,
      category,
      status,
      featured,
      photos,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/(site)/shop/[category]", "page");
  revalidatePath("/(site)/product/[slug]", "page");
  redirect("/admin/products?flash=Product updated");
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const payload = await getPayloadClient();
  await payload.delete({ collection: "products", id });
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/(site)/shop/[category]", "page");
  redirect("/admin/products?flash=Product deleted");
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  if (!name) return;

  const payload = await getPayloadClient();
  const [uploadedImageId] = await uploadNewPhotos(payload, formData, name, "categoryImage");

  await payload.create({
    collection: "categories",
    data: {
      name,
      slug: slugify(name),
      description,
      image: uploadedImageId,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/shop");
  redirect("/admin/categories?flash=Category added");
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const payload = await getPayloadClient();
  await payload.delete({ collection: "categories", id });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/shop");
  redirect("/admin/categories?flash=Category deleted");
}

export async function updateOrderStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const orderStatus = String(formData.get("orderStatus") ?? "");
  if (!id || !orderStatus) return;

  const payload = await getPayloadClient();
  await payload.update({
    collection: "orders",
    id,
    data: { orderStatus: orderStatus as "new" | "processing" | "shipped" | "completed" | "cancelled" },
  });

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${id}?flash=Order status updated`);
}

export async function markOrderPaidManually(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const payload = await getPayloadClient();
  const order = await payload.update({
    collection: "orders",
    id,
    data: { paymentStatus: "paid" },
  });

  await notifyPaymentConfirmed({ id: order.id, buyerName: order.buyerName, total: order.total });

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${id}?flash=Order marked as paid`);
}

export async function updateSiteSettings(formData: FormData) {
  const payload = await getPayloadClient();

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      shopName: String(formData.get("shopName") ?? ""),
      payment: {
        gcashNumber: String(formData.get("gcashNumber") ?? ""),
        gcashQrCode: formData.get("gcashQrCode") ? Number(formData.get("gcashQrCode")) : null,
        bpiAccountName: String(formData.get("bpiAccountName") ?? ""),
        bpiAccountNumber: String(formData.get("bpiAccountNumber") ?? ""),
      },
      shipping: {
        standardFee: Number(formData.get("standardFee") ?? 0),
        freeShippingThreshold: formData.get("freeShippingThreshold")
          ? Number(formData.get("freeShippingThreshold"))
          : undefined,
        pickupLocation: String(formData.get("pickupLocation") ?? ""),
      },
      social: {
        showSocialLinks: formData.get("showSocialLinks") === "on",
        instagram: String(formData.get("instagram") ?? ""),
        showInstagram: formData.get("showInstagram") === "on",
        facebook: String(formData.get("facebook") ?? ""),
        showFacebook: formData.get("showFacebook") === "on",
        tiktok: String(formData.get("tiktok") ?? ""),
        showTiktok: formData.get("showTiktok") === "on",
      },
      contactEmail: String(formData.get("contactEmail") ?? ""),
      logo: formData.get("logo") ? Number(formData.get("logo")) : null,
      returnPolicy: textToLexical(String(formData.get("returnPolicy") ?? "")),
      promotions: {
        saleBannerEnabled: formData.get("saleBannerEnabled") === "on",
        discountPercent: Number(formData.get("discountPercent") ?? 20),
        category: formData.get("promoCategory") ? Number(formData.get("promoCategory")) : null,
        headline: String(formData.get("promoHeadline") ?? ""),
        subtext: String(formData.get("promoSubtext") ?? ""),
      },
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/notifications");
  revalidatePath("/", "layout");
  revalidatePath("/checkout");
  revalidatePath("/contact");
  revalidatePath("/shop");
  revalidatePath("/(site)/shop/[category]", "page");
  revalidatePath("/(site)/product/[slug]", "page");
  revalidatePath("/admin/login");
  redirect("/admin/settings?flash=Settings saved");
}

export async function updateNotificationToggles(formData: FormData) {
  const payload = await getPayloadClient();

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      notificationEmail: String(formData.get("notificationEmail") ?? ""),
      notifications: {
        newOrder: formData.get("newOrder") === "on",
        paymentConfirmed: formData.get("paymentConfirmed") === "on",
        paymentFailed: formData.get("paymentFailed") === "on",
        contactForm: formData.get("contactForm") === "on",
        lowStock: formData.get("lowStock") === "on",
      },
    },
  });

  revalidatePath("/admin/notifications");
  revalidatePath("/admin/settings");
  redirect("/admin/notifications?flash=Notification preferences saved");
}
