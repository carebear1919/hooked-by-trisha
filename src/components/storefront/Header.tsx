"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
];

export default function Header({
  shopName = "Handmade Crochet Co.",
  logoUrl,
}: {
  shopName?: string;
  logoUrl?: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const router = useRouter();

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = searchQuery.trim();
    setSearchOpen(false);
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
  }

  return (
    <header className="w-full sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-surface-container-low">
      <div className="flex justify-between items-center w-full px-container-padding max-w-[1280px] mx-auto h-20">
        <Link className="flex items-center gap-2" href="/">
          {logoUrl ? (
            <span className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
              <Image src={logoUrl} alt={shopName} fill sizes="36px" className="object-cover" />
            </span>
          ) : (
            <span aria-hidden className="material-symbols-outlined text-primary text-2xl">
              spa
            </span>
          )}
          <span className="font-headline text-headline-sm font-bold text-on-surface">
            {shopName}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {searchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="hidden sm:flex items-center gap-1 bg-surface-container-low rounded-full pl-3 pr-1 py-1"
            >
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setSearchOpen(false);
                }}
                placeholder="Search products..."
                className="bg-transparent outline-none text-body-md text-on-surface placeholder:text-on-surface-variant w-40"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="text-on-surface-variant hover:text-primary transition-colors p-1"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
            </form>
          ) : (
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:inline-flex text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
          )}
          <Link
            aria-label={`Wishlist, ${wishlistCount} items`}
            href="/wishlist"
            className="relative hidden sm:inline-flex text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">favorite_border</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-on-primary">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            aria-label={`Cart, ${cartCount} items`}
            href="/cart"
            className="relative text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-on-primary">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden text-on-surface-variant"
          >
            <span className="material-symbols-outlined">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav aria-label="Mobile" className="md:hidden border-t border-surface-container-low bg-surface px-container-padding py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-body text-body-md text-on-surface-variant hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
