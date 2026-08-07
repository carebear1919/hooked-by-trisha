"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type WishlistItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  alt: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  has: (slug: string) => boolean;
  toggle: (item: WishlistItem) => boolean; // returns the new "is wishlisted" state
  remove: (slug: string) => void;
  count: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = "hbt_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const has = (slug: string) => items.some((i) => i.slug === slug);

  const toggle = (item: WishlistItem): boolean => {
    const alreadyIn = items.some((i) => i.slug === item.slug);
    setItems((prev) =>
      alreadyIn ? prev.filter((i) => i.slug !== item.slug) : [...prev, item]
    );
    return !alreadyIn;
  };

  const remove = (slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  };

  const count = useMemo(() => items.length, [items]);

  return (
    <WishlistContext.Provider value={{ items, has, toggle, remove, count }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
