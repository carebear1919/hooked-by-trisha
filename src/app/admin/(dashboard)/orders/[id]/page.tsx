import { Suspense } from "react";
import { notFound } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import FlashToast from "@/components/admin/FlashToast";
import NotificationHighlight from "@/components/admin/NotificationHighlight";
import { getPayloadClient } from "@/lib/payload";
import { markOrderPaidManually, updateOrderStatus } from "../../actions";

const STATUS_OPTIONS = ["new", "processing", "shipped", "completed", "cancelled"] as const;

type OrderItem = {
  product?: number | string | { name?: string } | null;
  quantity: number;
  priceSnapshot: number;
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await getPayloadClient();

  const order = await payload.findByID({ collection: "orders", id, depth: 1 }).catch(() => null);
  if (!order) notFound();

  const items = (order.items ?? []) as OrderItem[];

  return (
    <>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <Suspense fallback={null}>
        <NotificationHighlight />
      </Suspense>
      <AdminTopbar
        title={`Orders / #${order.id}`}
        actions={
          <form action={updateOrderStatus} className="flex items-center gap-3">
            <input type="hidden" name="id" value={order.id} />
            <div className="relative">
              <select
                name="orderStatus"
                defaultValue={order.orderStatus ?? "new"}
                className="appearance-none bg-surface-container-low border border-outline-variant rounded-full px-6 py-2.5 pr-10 font-body text-label-md focus:ring-primary focus:border-primary cursor-pointer capitalize"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
              <span
                aria-hidden
                className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline"
              >
                expand_more
              </span>
            </div>
            <button
              type="submit"
              className="bg-primary text-on-primary font-body text-label-md px-8 py-2.5 rounded-full hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <span aria-hidden className="material-symbols-outlined text-sm">
                save
              </span>
              Save Changes
            </button>
          </form>
        }
      />
      <div className="p-6 md:p-8 max-w-[1280px]" data-highlight-target={`order-${order.id}`}>
        <div className="grid grid-cols-12 gap-gutter items-start">
          <div className="col-span-12 lg:col-span-8 space-y-gutter">
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-headline text-headline-sm text-primary">Items Ordered</h2>
                <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-4 py-1 rounded-full font-body text-[12px]">
                  {items.length} Items
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 font-body text-label-md text-on-surface-variant">
                      <th className="pb-4 font-medium uppercase tracking-wider">Product</th>
                      <th className="pb-4 font-medium uppercase tracking-wider text-center">Quantity</th>
                      <th className="pb-4 font-medium uppercase tracking-wider text-right">Price</th>
                      <th className="pb-4 font-medium uppercase tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="font-body text-body-md">
                    {items.map((item, i) => {
                      const productName =
                        typeof item.product === "object" && item.product ? item.product.name : "Product";
                      return (
                        <tr key={i} className="border-b border-outline-variant/20">
                          <td className="py-6">
                            <div className="flex items-center gap-4">
                              <div
                                aria-hidden
                                className="w-16 h-16 rounded-lg bg-surface-container shadow-sm shrink-0"
                              />
                              <p className="font-bold text-on-surface">{productName}</p>
                            </div>
                          </td>
                          <td className="py-6 text-center">{item.quantity}</td>
                          <td className="py-6 text-right">₱{item.priceSnapshot.toLocaleString("en-PH")}</td>
                          <td className="py-6 text-right font-bold text-primary">
                            ₱{(item.priceSnapshot * item.quantity).toLocaleString("en-PH")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-10 flex flex-col items-end">
                <div className="w-full lg:w-64 space-y-2 border-t border-outline-variant/30 pt-6">
                  <div className="flex justify-between font-body text-label-md text-on-surface-variant">
                    <span>Subtotal</span>
                    <span>₱{order.subtotal.toLocaleString("en-PH")}</span>
                  </div>
                  <div className="flex justify-between font-body text-label-md text-on-surface-variant">
                    <span>Shipping</span>
                    <span>₱{order.shippingFee.toLocaleString("en-PH")}</span>
                  </div>
                  <div className="flex justify-between font-headline text-[20px] text-primary pt-2 border-t border-outline-variant/10">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">₱{order.total.toLocaleString("en-PH")}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-gutter">
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span aria-hidden className="material-symbols-outlined text-primary">
                  person
                </span>
                <h3 className="font-headline text-[20px] text-primary">Buyer Details</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                    Name
                  </p>
                  <p className="font-body text-body-md text-on-surface">{order.buyerName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                    Contact Info
                  </p>
                  <div className="space-y-1">
                    {order.contactNumber && (
                      <p className="font-body text-body-md text-on-surface flex items-center gap-2">
                        <span aria-hidden className="material-symbols-outlined text-sm text-outline">
                          call
                        </span>
                        {order.contactNumber}
                      </p>
                    )}
                    <p className="font-body text-body-md text-on-surface flex items-center gap-2">
                      <span aria-hidden className="material-symbols-outlined text-sm text-outline">
                        mail
                      </span>
                      {order.email}
                    </p>
                  </div>
                </div>
                {order.address && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                      Shipping Address
                    </p>
                    <p className="font-body text-body-md text-on-surface leading-relaxed whitespace-pre-line">
                      {order.address}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span aria-hidden className="material-symbols-outlined text-primary">
                    payments
                  </span>
                  <h3 className="font-headline text-[20px] text-primary">Payment Info</h3>
                </div>
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
                    order.paymentStatus === "paid"
                      ? "bg-primary-container/20 text-primary"
                      : "bg-tertiary-container/20 text-tertiary"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="space-y-5">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                        Method
                      </p>
                      <p className="font-body text-body-md text-on-surface font-bold uppercase">
                        {order.paymentMethod ?? "—"}
                      </p>
                    </div>
                  </div>
                  {order.paymentReference && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                        Reference ID
                      </p>
                      <code className="font-mono text-sm text-primary bg-primary-fixed/30 px-2 py-0.5 rounded">
                        {order.paymentReference}
                      </code>
                    </div>
                  )}
                </div>
                <form action={markOrderPaidManually}>
                  <input type="hidden" name="id" value={order.id} />
                  <button
                    type="submit"
                    disabled={order.paymentStatus === "paid"}
                    className="w-full border border-primary text-primary font-body text-label-md py-3 rounded-full hover:bg-primary/5 transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span aria-hidden className="material-symbols-outlined">
                      check_circle
                    </span>
                    Mark as Paid Manually
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
