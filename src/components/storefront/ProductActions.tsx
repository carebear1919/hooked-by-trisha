"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StockStatus } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useWishlist } from "@/lib/wishlist-context";

type Product = {
  slug: string;
  name: string;
  price: number;
  image: string;
  alt: string;
};

export default function ProductActions({ product, stock }: { product: Product; stock: StockStatus }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = stock === "sold-out";
  const { addItem } = useCart();
  const toast = useToast();
  const router = useRouter();
  const { has: isWishlisted, toggle: toggleWishlistItem } = useWishlist();
  const wishlisted = isWishlisted(product.slug);

  const handleAddToCart = () => {
    addItem(
      { slug: product.slug, name: product.name, price: product.price, image: product.image, alt: product.alt },
      quantity
    );
    setAdded(true);
    toast(`Added ${quantity > 1 ? `${quantity}x ` : ""}${product.name} to cart`, "success");
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(
      { slug: product.slug, name: product.name, price: product.price, image: product.image, alt: product.alt },
      quantity
    );
    router.push("/checkout");
  };

  const toggleWishlist = () => {
    const nowIn = toggleWishlistItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      alt: product.alt,
    });
    toast(nowIn ? `Added ${product.name} to wishlist` : `Removed ${product.name} from wishlist`, nowIn ? "success" : "info");
  };

  return (
    <div className="space-y-6 mb-10">
      <div className="flex items-center gap-6">
        <span className="font-body text-label-md uppercase tracking-widest text-on-surface">
          Quantity
        </span>
        <div className="flex items-center bg-secondary-container rounded-full px-4 py-2 border border-outline-variant">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-1 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden>
              remove
            </span>
          </button>
          <span className="w-12 text-center font-bold" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="p-1 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden>
              add
            </span>
          </button>
        </div>
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={toggleWishlist}
          className="ml-auto p-2 rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors"
        >
          <span
            className={`material-symbols-outlined ${wishlisted ? "text-error" : "text-primary"}`}
            style={{ fontVariationSettings: `'FILL' ${wishlisted ? 1 : 0}` }}
            aria-hidden
          >
            favorite
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          disabled={soldOut}
          onClick={handleAddToCart}
          className="bg-primary text-on-primary font-body text-label-md py-4 rounded-full flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined" aria-hidden>
            {added ? "check" : "shopping_bag"}
          </span>
          {soldOut ? "Sold Out" : added ? "Added to Cart" : "Add to Cart"}
        </button>
        <button
          type="button"
          disabled={soldOut}
          onClick={handleBuyNow}
          className="border-2 border-primary text-primary font-body text-label-md py-4 rounded-full hover:bg-surface-container-high transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
