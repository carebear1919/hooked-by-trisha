"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPHP } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";

const SHIPPING_FEE = 150;

export default function CartPage() {
  const { items, removeItem, setQuantity, subtotal } = useCart();
  const toast = useToast();

  const handleRemove = (slug: string, name: string) => {
    removeItem(slug);
    toast(`Removed ${name} from cart`, "info");
  };

  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-container-padding py-24 flex flex-col items-center text-center">
        <span
          aria-hidden
          className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-6"
        >
          shopping_bag
        </span>
        <h1 className="font-headline text-headline-lg text-on-surface mb-2">
          Your cart is empty
        </h1>
        <p className="font-body text-body-md text-on-surface-variant max-w-md mb-8">
          Looks like you haven&apos;t added anything to your cart yet. Explore
          our handmade collection and find something you&apos;ll love.
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
    <div className="max-w-[1280px] mx-auto px-container-padding py-12 md:py-20">
      <h1 className="font-headline text-headline-lg mb-12 text-primary">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-8">
          {items.map((item) => (
            <div
              key={item.slug}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-surface-container-low rounded-xl group transition-all duration-300"
            >
              <Link href={`/product/${item.slug}`} className="relative w-32 h-32 shrink-0 bg-surface-container-highest rounded-lg overflow-hidden">
                <Image
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="128px"
                />
              </Link>
              <div className="flex-grow w-full">
                <div className="flex justify-between items-start">
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="font-headline text-headline-sm text-on-surface mb-1">
                      {item.name}
                    </h3>
                  </Link>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => handleRemove(item.slug, item.name)}
                    className="text-on-surface-variant hover:text-error transition-colors p-2"
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      delete
                    </span>
                  </button>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center bg-surface-container-high rounded-full px-2 py-1">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() => setQuantity(item.slug, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-on-surface hover:text-primary transition-colors"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        aria-hidden
                      >
                        remove
                      </span>
                    </button>
                    <span
                      className="px-4 font-body text-label-md text-on-surface"
                      aria-live="polite"
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => setQuantity(item.slug, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-on-surface hover:text-primary transition-colors"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        aria-hidden
                      >
                        add
                      </span>
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-on-surface-variant font-body text-label-md mb-1">
                      Subtotal
                    </p>
                    <p className="font-headline text-headline-sm text-primary">
                      {formatPHP(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-surface-container-high">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-primary hover:gap-4 transition-all duration-300 font-body text-label-md"
            >
              <span className="material-symbols-outlined" aria-hidden>
                arrow_back
              </span>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32 bg-secondary-container p-8 rounded-xl shadow-sm">
            <h2 className="font-headline text-headline-sm text-primary mb-8 border-b border-outline-variant pb-4">
              Order Summary
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-on-secondary-container">
                <span className="font-body text-body-md">Subtotal</span>
                <span className="font-body text-label-md">
                  {formatPHP(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-on-secondary-container">
                <span className="font-body text-body-md">
                  Shipping Estimate
                </span>
                <span className="font-body text-label-md">
                  {formatPHP(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-on-secondary-container pt-4 border-t border-outline-variant">
                <span className="font-headline text-headline-sm">Total</span>
                <span className="font-headline text-headline-sm font-bold text-primary">
                  {formatPHP(total)}
                </span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="w-full py-4 bg-primary text-on-primary hover:bg-primary/90 transition-all duration-300 rounded-full font-body text-label-md flex items-center justify-center gap-2 mb-6"
            >
              Proceed to Checkout
              <span className="material-symbols-outlined text-[18px]" aria-hidden>
                lock
              </span>
            </Link>
            <div className="space-y-4">
              <p className="text-center text-on-secondary-fixed-variant text-[12px] font-body uppercase tracking-wider">
                Secure Payment Options
              </p>
              <div className="flex justify-center items-center gap-4 text-on-secondary-container/80 font-body text-label-md">
                <span>GCash</span>
                <span aria-hidden>&middot;</span>
                <span>BPI</span>
                <span aria-hidden>&middot;</span>
                <span>Card</span>
              </div>
            </div>
            <div className="mt-8 p-4 bg-surface-container-low/50 rounded-lg">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-tertiary" aria-hidden>
                  eco
                </span>
                <p className="text-[12px] text-on-surface-variant leading-relaxed">
                  Your purchase supports slow fashion and sustainable living.
                  Each piece is handcrafted with recycled or organic
                  materials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
