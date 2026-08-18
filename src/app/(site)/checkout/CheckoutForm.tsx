"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { createOrder } from "./actions";

const PAYMENT_METHODS = [
  { value: "gcash", icon: "account_balance_wallet", title: "GCash" },
  { value: "bpi", icon: "account_balance", title: "BPI Online" },
] as const;

function formatPHP(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

export default function CheckoutForm({
  standardFee,
  freeShippingThreshold,
  pickupLocation,
  gcashNumber,
  gcashQrCodeUrl,
  bpiAccountName,
  bpiAccountNumber,
}: {
  standardFee: number;
  freeShippingThreshold: number | null;
  pickupLocation: string;
  gcashNumber: string;
  gcashQrCodeUrl: string | null;
  bpiAccountName: string;
  bpiAccountNumber: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const { items, subtotal, clear } = useCart();

  const qualifiesForFreeShipping =
    freeShippingThreshold != null && freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;

  const DELIVERY_METHODS = [
    {
      value: "standard" as const,
      icon: "local_shipping",
      title: "Standard Delivery",
      sub: "3-5 Working Days",
      fee: qualifiesForFreeShipping ? 0 : standardFee,
    },
    {
      value: "pickup" as const,
      icon: "store",
      title: "Local Pickup",
      sub: pickupLocation || "Free",
      fee: 0,
    },
  ];

  const [delivery, setDelivery] = useState<(typeof DELIVERY_METHODS)[number]["value"]>("standard");
  const [payment, setPayment] = useState<(typeof PAYMENT_METHODS)[number]["value"]>("gcash");
  const [showManualPaid, setShowManualPaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingFee = DELIVERY_METHODS.find((m) => m.value === delivery)?.fee ?? 0;
  const total = subtotal + shippingFee;

  const showRedirectNote = payment === "gcash" || payment === "bpi";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0 || submitting) return;

    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);

    try {
      const { orderId } = await createOrder({
        fullName: String(formData.get("fullName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        address: String(formData.get("address") ?? ""),
        deliveryMethod: delivery,
        paymentMethod: payment,
        paymentReference: String(formData.get("paymentReference") ?? "").trim() || undefined,
        items: items.map((item) => ({ slug: item.slug, price: item.price, quantity: item.quantity })),
        shippingFee,
      });
      clear();
      toast("Order placed!", "success");
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch {
      setError("Something went wrong placing your order. Please try again.");
      toast("Something went wrong placing your order.", "error");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[640px] mx-auto px-container-padding py-24 flex flex-col items-center text-center">
        <span aria-hidden className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-6">
          shopping_bag
        </span>
        <h1 className="font-headline text-headline-lg text-on-surface mb-2">Your cart is empty</h1>
        <p className="font-body text-body-md text-on-surface-variant max-w-md mb-8">
          Add something to your cart before heading to checkout.
        </p>
        <Link
          href="/shop"
          className="px-8 py-3 bg-primary text-on-primary font-body text-label-md rounded-full hover:bg-primary/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Step indicator strip (Cart -> Checkout -> Confirmation) */}
      <div className="w-full pt-8 pb-2 text-center">
        <nav
          aria-label="Checkout progress"
          className="flex justify-center items-center gap-4 font-body text-label-md uppercase tracking-widest text-on-surface-variant"
        >
          <Link href="/cart" className="hover:text-primary transition-colors">
            Cart
          </Link>
          <span className="material-symbols-outlined text-[16px]" aria-hidden>
            chevron_right
          </span>
          <span className="text-primary font-bold border-b-2 border-primary pb-1">Checkout</span>
          <span className="material-symbols-outlined text-[16px]" aria-hidden>
            chevron_right
          </span>
          <span className="opacity-50">Confirmation</span>
        </nav>
      </div>

      <div className="max-w-[1280px] mx-auto px-container-padding pb-section-gap">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-12 mt-8">
          {/* Left Column: Checkout Forms */}
          <form id="checkout-form" className="lg:col-span-7 space-y-12" onSubmit={handleSubmit}>
            {/* Contact & Delivery */}
            <section>
              <h2 className="font-headline text-headline-md text-primary mb-8">Contact &amp; Delivery</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="fullName" className="font-body text-label-md uppercase text-on-surface-variant">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      placeholder="Trisha Mae"
                      className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary-container outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="font-body text-label-md uppercase text-on-surface-variant">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+63 900 000 0000"
                      className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary-container outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="font-body text-label-md uppercase text-on-surface-variant">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="hello@example.com"
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary-container outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="address" className="font-body text-label-md uppercase text-on-surface-variant">
                    Shipping Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    required={delivery === "standard"}
                    rows={3}
                    placeholder="Street, Barangay, City, Province, Zip Code"
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary-container outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Delivery Method */}
              <div className="mt-8 space-y-4">
                <span className="font-body text-label-md uppercase text-on-surface-variant">Delivery Method</span>
                {freeShippingThreshold != null && freeShippingThreshold > 0 && !qualifiesForFreeShipping && (
                  <p className="font-body text-label-md text-primary">
                    Add {formatPHP(freeShippingThreshold - subtotal)} more to unlock free standard delivery.
                  </p>
                )}
                {qualifiesForFreeShipping && (
                  <p className="font-body text-label-md text-primary font-bold">
                    🎉 You&apos;ve unlocked free standard delivery!
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DELIVERY_METHODS.map((method) => (
                    <label
                      key={method.value}
                      className={`relative flex items-center p-4 bg-surface-container-low rounded-xl cursor-pointer border-2 transition-all ${
                        delivery === method.value ? "border-primary-container" : "border-transparent"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={method.value}
                        checked={delivery === method.value}
                        onChange={() => setDelivery(method.value)}
                        className="sr-only"
                      />
                      <span className="material-symbols-outlined mr-3 text-primary-container" aria-hidden>
                        {method.icon}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{method.title}</span>
                        <span className="font-body text-label-md text-on-surface-variant">{method.sub}</span>
                      </div>
                      <div className="ml-auto font-bold text-primary">
                        {method.fee === 0 ? "FREE" : formatPHP(method.fee)}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="font-headline text-headline-md text-primary mb-8">Payment Method</h2>
              <div className="space-y-4">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center p-5 bg-surface-container-low rounded-xl cursor-pointer border-2 transition-all ${
                      payment === method.value ? "border-primary-container" : "border-transparent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={payment === method.value}
                      onChange={() => setPayment(method.value)}
                      className="w-5 h-5 text-primary-container focus:ring-primary-container"
                    />
                    <div className="ml-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary-container" aria-hidden>
                        {method.icon}
                      </span>
                      <span className="font-bold">{method.title}</span>
                    </div>
                  </label>
                ))}

                {showRedirectNote && (
                  <div className="bg-primary-container/5 border border-primary-container/20 rounded-xl p-4 mt-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary-container text-[20px]" aria-hidden>
                      info
                    </span>
                    <p className="font-body text-body-md text-on-surface-variant">
                      You&apos;ll be redirected to a secure payment page after clicking &apos;Place Order&apos;.
                    </p>
                  </div>
                )}

                {/* Manual payment fallback */}
                {showRedirectNote && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowManualPaid((v) => !v)}
                      className="font-body text-label-md text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                    >
                      Paid via {paymentMethodLabel(payment)} already? Show QR / I&apos;ve paid
                    </button>
                    {showManualPaid && (
                      <div className="mt-4 bg-surface-container-low rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative w-32 h-32 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0 overflow-hidden">
                          {gcashQrCodeUrl && payment === "gcash" ? (
                            <Image
                              src={gcashQrCodeUrl}
                              alt="GCash payment QR code"
                              fill
                              sizes="128px"
                              className="object-contain"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-4xl" aria-hidden>
                              qr_code_2
                            </span>
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <p className="font-body text-body-md text-on-surface-variant">
                            Scan the QR code to pay manually via GCash or bank transfer, then enter your reference
                            number and confirm below. Our team will manually verify and confirm your payment.
                          </p>
                          {payment === "gcash" && gcashNumber && (
                            <p className="font-body text-body-md text-on-surface">
                              <span className="text-on-surface-variant">GCash Number: </span>
                              <span className="font-bold">{gcashNumber}</span>
                            </p>
                          )}
                          {payment === "bpi" && (bpiAccountName || bpiAccountNumber) && (
                            <p className="font-body text-body-md text-on-surface">
                              <span className="text-on-surface-variant">BPI Account: </span>
                              <span className="font-bold">
                                {bpiAccountName}
                                {bpiAccountName && bpiAccountNumber ? " — " : ""}
                                {bpiAccountNumber}
                              </span>
                            </p>
                          )}
                          <input
                            name="paymentReference"
                            placeholder="Reference number (optional)"
                            className="w-full bg-surface border border-outline-variant rounded-xl p-3 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all"
                          />
                          <button
                            type="submit"
                            form="checkout-form"
                            disabled={submitting}
                            className="px-6 py-2 bg-surface-container-high text-on-surface rounded-full font-body text-label-md hover:bg-surface-variant transition-colors disabled:opacity-60"
                          >
                            I&apos;ve Paid — Flag for Confirmation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </form>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 bg-secondary-container rounded-[24px] p-8 space-y-8 shadow-sm">
              <h3 className="font-headline text-headline-sm text-primary">Order Summary</h3>

              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.slug} className="flex gap-4 items-center">
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-surface">
                      <Image className="object-cover" alt={item.alt} src={item.image} fill sizes="80px" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-on-surface">{item.name}</h4>
                      <p className="text-on-surface-variant font-body text-label-md uppercase">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-primary font-bold mt-1">{formatPHP(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-outline-variant pt-6 space-y-3">
                <div className="flex justify-between font-body text-body-md text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>{formatPHP(subtotal)}</span>
                </div>
                <div className="flex justify-between font-body text-body-md text-on-surface-variant">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? "FREE" : formatPHP(shippingFee)}</span>
                </div>
                <div className="flex justify-between font-headline text-headline-sm text-primary pt-4">
                  <span>Total</span>
                  <span>{formatPHP(total)}</span>
                </div>
              </div>

              {error && (
                <p className="text-center font-body text-label-md text-error">{error}</p>
              )}
              <button
                type="submit"
                form="checkout-form"
                disabled={submitting}
                className="w-full bg-primary-container text-on-primary-container py-5 rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-60 disabled:pointer-events-none"
              >
                {submitting ? "Placing Order..." : "Place Order"}
                <span className="material-symbols-outlined transition-transform" aria-hidden>
                  arrow_forward
                </span>
              </button>
              <p className="text-center font-body text-label-md text-on-surface-variant opacity-70">
                Orders are typically processed within 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal footer trust row (per spec: checkout footer is minimal) */}
      <div className="w-full py-12 border-t border-secondary-container">
        <div className="max-w-[1280px] mx-auto px-container-padding flex flex-col md:flex-row justify-between items-center gap-6 text-on-surface-variant font-body text-label-md uppercase tracking-widest opacity-80">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden>
              verified_user
            </span>
            <span>Secure SSL Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden>
              workspace_premium
            </span>
            <span>Verified Handmade Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden>
              public
            </span>
            <span>Sustainable Shipping</span>
          </div>
        </div>
      </div>
    </>
  );
}

function paymentMethodLabel(payment: (typeof PAYMENT_METHODS)[number]["value"]) {
  if (payment === "gcash") return "GCash";
  if (payment === "bpi") return "bank transfer";
  return "GCash/bank transfer";
}
