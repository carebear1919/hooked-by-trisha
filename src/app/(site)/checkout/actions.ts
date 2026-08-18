"use server";

import { revalidatePath } from "next/cache";
import { getPayloadClient } from "@/lib/payload";
import { notifyLowStock, notifyNewOrder } from "@/lib/notify";

export type CheckoutInput = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  deliveryMethod: "standard" | "pickup";
  paymentMethod: "gcash" | "bpi";
  paymentReference?: string;
  items: { slug: string; price: number; quantity: number }[];
  shippingFee: number;
};

const LOW_STOCK_THRESHOLD = 5;

export async function createOrder(input: CheckoutInput): Promise<{ orderId: string | number }> {
  if (input.items.length === 0) {
    throw new Error("Cannot place an order with an empty cart.");
  }

  const payload = await getPayloadClient();

  const resolvedItems = await Promise.all(
    input.items.map(async (item) => {
      const { docs } = await payload.find({
        collection: "products",
        where: { slug: { equals: item.slug } },
        limit: 1,
      });
      const product = docs[0] as { id: number | string; stock: number } | undefined;
      return {
        product: product?.id,
        quantity: item.quantity,
        priceSnapshot: item.price,
        currentStock: product?.stock,
      };
    })
  );

  const subtotal = resolvedItems.reduce((sum, i) => sum + i.priceSnapshot * i.quantity, 0);
  const total = subtotal + input.shippingFee;

  const order = await payload.create({
    collection: "orders",
    data: {
      buyerName: input.fullName,
      contactNumber: input.phone,
      email: input.email,
      address: input.deliveryMethod === "pickup" ? "Local Pickup — QC Studio" : input.address,
      items: resolvedItems.map(({ product, quantity, priceSnapshot }) => ({
        product,
        quantity,
        priceSnapshot,
      })),
      subtotal,
      shippingFee: input.shippingFee,
      total,
      paymentMethod: input.paymentMethod,
      paymentReference: input.paymentReference,
      paymentStatus: "pending",
      orderStatus: "new",
    },
  });

  // Decrement stock and flag any product that just crossed the low-stock threshold.
  await Promise.all(
    resolvedItems.map(async (item) => {
      if (item.product == null || item.currentStock == null) return;
      const newStock = Math.max(0, item.currentStock - item.quantity);
      await payload.update({ collection: "products", id: item.product, data: { stock: newStock } });
      if (newStock <= LOW_STOCK_THRESHOLD && item.currentStock > LOW_STOCK_THRESHOLD) {
        const updated = await payload.findByID({ collection: "products", id: item.product });
        await notifyLowStock({ id: item.product, name: updated.name, stock: newStock });
      }
    })
  );

  await notifyNewOrder({ id: order.id, buyerName: order.buyerName, total: order.total });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");

  return { orderId: order.id };
}
