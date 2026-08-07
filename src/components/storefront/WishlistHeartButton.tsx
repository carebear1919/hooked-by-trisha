"use client";

import { useWishlist, type WishlistItem } from "@/lib/wishlist-context";
import { useToast } from "@/lib/toast-context";

export default function WishlistHeartButton({
  product,
  className,
}: {
  product: WishlistItem;
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const toast = useToast();
  const wishlisted = has(product.slug);

  return (
    <button
      type="button"
      aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      aria-pressed={wishlisted}
      onClick={() => {
        const nowIn = toggle(product);
        toast(nowIn ? `Added ${product.name} to wishlist` : `Removed ${product.name} from wishlist`, nowIn ? "success" : "info");
      }}
      className={className ?? "w-8 h-8 bg-surface rounded-full flex items-center justify-center text-on-surface shadow-sm hover:text-error transition-colors"}
    >
      <span
        className="material-symbols-outlined text-sm"
        style={{ fontVariationSettings: `'FILL' ${wishlisted ? 1 : 0}` }}
        aria-hidden
      >
        favorite
      </span>
    </button>
  );
}
