import Link from "next/link";
import { getPayloadClient } from "@/lib/payload";
import { formatPHP } from "@/lib/format";

type OrderItem = {
  product?: { name?: string } | number | string | null;
  quantity: number;
  priceSnapshot: number;
};

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const payload = await getPayloadClient();
  const order = orderId
    ? await payload.findByID({ collection: "orders", id: orderId, depth: 1 }).catch(() => null)
    : null;

  if (!order) {
    return (
      <div className="max-w-[640px] mx-auto px-container-padding pt-16 pb-section-gap flex flex-col items-center text-center">
        <h1 className="font-headline text-headline-lg text-primary mb-4">We couldn&apos;t find that order</h1>
        <p className="font-body text-body-md text-on-surface-variant mb-8">
          The order link looks invalid or has expired.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-10 py-4 bg-primary text-on-primary rounded-full font-body text-label-md shadow-lg hover:bg-primary-container transition-all duration-300"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const items = (order.items ?? []) as OrderItem[];
  const isPaid = order.paymentStatus === "paid";

  return (
    <div className="max-w-[640px] mx-auto px-container-padding pt-16 pb-section-gap flex flex-col items-center text-center">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mb-8">
        <span
          className="material-symbols-outlined text-primary text-[48px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden
        >
          check_circle
        </span>
      </div>

      {/* Confirmation Message */}
      <h1 className="font-headline text-headline-lg text-primary mb-2">Thank You for Your Order!</h1>
      <p className="font-body text-label-md tracking-widest text-on-surface-variant uppercase mb-12">
        #{order.id}
      </p>

      {/* Order Summary Card */}
      <div className="w-full bg-surface-container-low rounded-xl p-8 mb-10 shadow-sm text-left">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-headline-sm text-primary">Summary</h3>
          <span
            className={`px-4 py-1 rounded-full text-[12px] font-bold tracking-wider uppercase ${
              isPaid ? "bg-primary-container text-on-primary-container" : "bg-tertiary-fixed text-on-tertiary-fixed"
            }`}
          >
            {isPaid ? "Paid" : "Pending Confirmation"}
          </span>
        </div>

        <div className="space-y-6 mb-8">
          {items.map((item, i) => {
            const name = typeof item.product === "object" && item.product ? item.product.name : "Product";
            return (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-grow">
                  <h4 className="font-body text-body-md font-bold text-on-surface">{name}</h4>
                  <p className="text-[14px] text-on-surface-variant">Qty: {item.quantity}</p>
                </div>
                <span className="font-body text-body-md text-on-surface">
                  {formatPHP(item.priceSnapshot * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-outline-variant pt-6 flex justify-between items-end">
          <div>
            <p className="text-[14px] text-on-surface-variant mb-1">
              {isPaid ? "Total Amount Paid" : "Total Amount Due"}
            </p>
            <p className="font-headline text-headline-md text-primary">{formatPHP(order.total)}</p>
          </div>
          <div className="text-right">
            <p className="text-[14px] text-on-surface-variant">Shipping to</p>
            <p className="text-[14px] font-medium">{order.address || "Local Pickup"}</p>
          </div>
        </div>
      </div>

      <p className="font-body text-body-md text-on-surface-variant mb-12 italic">
        We&apos;ll message you once your order ships.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center px-10 py-4 border border-primary text-primary rounded-full font-body text-label-md hover:bg-secondary-container transition-all duration-300"
        >
          Something Look Wrong? Contact Us
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-10 py-4 bg-primary text-on-primary rounded-full font-body text-label-md shadow-lg hover:bg-primary-container transition-all duration-300"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
