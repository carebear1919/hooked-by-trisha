"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPHP } from "@/lib/format";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const { addItem } = useCart();
  const toast = useToast();

  if (items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-container-padding py-24 flex flex-col items-center text-center">
        <span aria-hidden className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-6">
          favorite_border
        </span>
        <h1 className="font-headline text-headline-lg text-on-surface mb-2">Your wishlist is empty</h1>
        <p className="font-body text-body-md text-on-surface-variant max-w-md mb-8">
          Tap the heart on any product to save it here for later.
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
      <h1 className="font-headline text-headline-lg mb-12 text-primary">Your Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-gutter gap-y-12">
        {items.map((item) => (
          <div key={item.slug} className="group relative flex flex-col">
            <div className="relative aspect-4/5 bg-surface-container-low rounded-xl overflow-hidden mb-4">
              <Link href={`/product/${item.slug}`} className="absolute inset-0 z-0">
                <Image
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={item.alt}
                  src={item.image}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
              </Link>
              <button
                type="button"
                aria-label={`Remove ${item.name} from wishlist`}
                onClick={() => {
                  remove(item.slug);
                  toast(`Removed ${item.name} from wishlist`, "info");
                }}
                className="absolute top-4 right-4 z-10 w-9 h-9 bg-surface/90 rounded-full flex items-center justify-center text-error shadow-sm hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden>
                  favorite
                </span>
              </button>
              <div className="absolute inset-x-4 bottom-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                <button
                  type="button"
                  onClick={() => {
                    addItem(item);
                    toast(`Added ${item.name} to cart`, "success");
                  }}
                  className="w-full py-2.5 bg-primary text-on-primary rounded-full font-body text-label-md shadow-lg hover:bg-primary/90 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
            <Link href={`/product/${item.slug}`}>
              <h3 className="font-headline text-headline-sm text-on-surface">{item.name}</h3>
              <p className="font-body text-label-md text-on-surface-variant mt-1">{formatPHP(item.price)}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
