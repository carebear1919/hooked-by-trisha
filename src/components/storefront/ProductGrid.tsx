"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPHP, stockLabel } from "@/lib/format";
import type { Category, Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useWishlist } from "@/lib/wishlist-context";

const PAGE_SIZE = 8;

type SortOption = "newest" | "price-asc" | "price-desc" | "best-selling";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
];

export default function ProductGrid({
  products,
  categories,
  lockedCategory,
  initialSearch,
}: {
  products: Product[];
  categories: Category[];
  /** When set (e.g. on a category page), the category checkbox for this slug is
   * always on and disabled instead of being a free-form filter. */
  lockedCategory?: string;
  initialSearch?: string;
}) {
  const { addItem } = useCart();
  const toast = useToast();
  const { has: isWishlisted, toggle: toggleWishlistItem } = useWishlist();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    lockedCategory ? [lockedCategory] : []
  );
  const priceCeiling = useMemo(
    () => Math.max(500, ...products.map((p) => Math.ceil(p.price / 250) * 250)),
    [products]
  );
  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("newest");
  const [search, setSearch] = useState(initialSearch ?? "");
  const [page, setPage] = useState(1);

  const toggleWishlist = (product: Product) => {
    const nowIn = toggleWishlistItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      alt: product.alt,
    });
    toast(nowIn ? `Added ${product.name} to wishlist` : `Removed ${product.name} from wishlist`, nowIn ? "success" : "info");
  };

  const toggleCategory = (slug: string) => {
    if (lockedCategory) return;
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedCategories(lockedCategory ? [lockedCategory] : []);
    setMaxPrice(priceCeiling);
    setInStockOnly(false);
    setSearch("");
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice);
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }
    if (inStockOnly) {
      list = list.filter((p) => p.stock !== "sold-out");
    }
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description ?? "").toLowerCase().includes(query)
      );
    }

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    // "newest" and "best-selling" both keep catalog order until real sales data exists

    return sorted;
  }, [products, selectedCategories, maxPrice, inStockOnly, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="flex flex-col md:flex-row gap-10">
      {/* Filter sidebar */}
      <aside className="w-full md:w-1/4 shrink-0 space-y-8">
        <div className="bg-surface-container-low p-6 rounded-xl space-y-8">
          <div>
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <div className="relative">
              <span
                aria-hidden
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
              >
                search
              </span>
              <input
                id="product-search"
                type="search"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search products..."
                className="w-full bg-surface-container-highest rounded-full pl-10 pr-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div>
            <h3 className="font-body text-label-md uppercase tracking-widest text-on-surface mb-4">
              Categories
            </h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <label
                  key={cat.slug}
                  className="flex items-center group cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => toggleCategory(cat.slug)}
                    disabled={lockedCategory === cat.slug}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary accent-primary"
                  />
                  <span className="ml-3 font-body text-body-md text-on-surface group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-body text-label-md uppercase tracking-widest text-on-surface mb-4">
              Price Range
            </h3>
            <div className="px-1">
              <input
                type="range"
                min={500}
                max={priceCeiling}
                step={250}
                value={maxPrice}
                onChange={(e) => {
                  setPage(1);
                  setMaxPrice(Number(e.target.value));
                }}
                aria-label="Maximum price"
                aria-valuetext={formatPHP(maxPrice)}
                className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-2 font-body text-label-md text-on-surface-variant">
                <span>₱500</span>
                <span>{formatPHP(maxPrice)}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="relative inline-flex items-center justify-between w-full cursor-pointer">
              <span className="font-body text-body-md text-on-surface">
                In Stock Only
              </span>
              <span className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setPage(1);
                    setInStockOnly(e.target.checked);
                  }}
                  className="sr-only peer"
                />
                <span className="w-11 h-6 bg-surface-container-highest rounded-full peer-checked:bg-primary transition-colors" />
                <span className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-full" />
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="w-full pt-4 border-t border-surface-container-high text-left font-body text-label-md text-secondary underline hover:text-primary transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </aside>

      {/* Product section */}
      <div className="w-full md:w-3/4">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <p className="font-body text-label-md text-on-surface-variant">
            Showing{" "}
            <span className="font-bold text-on-surface">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </span>
          </p>
          <label className="flex items-center gap-2 font-body text-label-md">
            <span className="text-on-surface-variant uppercase">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSort(e.target.value as SortOption);
              }}
              className="appearance-none bg-transparent border border-surface-container-high rounded-full pl-3 pr-8 py-1.5 text-primary font-bold cursor-pointer focus:ring-0 focus:border-primary"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {paged.length === 0 ? (
          <div className="py-20 text-center">
            <span
              aria-hidden
              className="material-symbols-outlined text-5xl text-on-surface-variant/40"
            >
              search_off
            </span>
            <p className="mt-4 font-body text-body-lg text-on-surface-variant">
              No products match your filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-full font-body text-label-md hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-gutter gap-y-12">
            {paged.map((product) => (
              <div key={product.slug} className="group relative flex flex-col">
                <div className="relative aspect-4/5 bg-surface-container-low rounded-xl overflow-hidden mb-4">
                  <Link
                    href={`/product/${product.slug}`}
                    className="absolute inset-0 z-0"
                  >
                    <Image
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={product.alt}
                      src={product.image}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </Link>
                  <button
                    type="button"
                    aria-label={
                      isWishlisted(product.slug)
                        ? `Remove ${product.name} from wishlist`
                        : `Add ${product.name} to wishlist`
                    }
                    aria-pressed={isWishlisted(product.slug)}
                    onClick={() => toggleWishlist(product)}
                    className={`absolute top-4 right-4 z-10 w-9 h-9 bg-surface/90 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                      isWishlisted(product.slug) ? "text-error" : "text-on-surface hover:text-error"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: `'FILL' ${isWishlisted(product.slug) ? 1 : 0}` }}
                      aria-hidden
                    >
                      favorite
                    </span>
                  </button>
                  <span
                    className={`absolute bottom-4 left-4 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      product.stock === "sold-out"
                        ? "bg-error-container text-on-error-container"
                        : product.stock === "low-stock"
                          ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                          : "bg-primary-fixed text-on-primary-fixed-variant"
                    }`}
                  >
                    {stockLabel(product.stock)}
                  </span>
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                    {product.featured && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tertiary text-on-tertiary">
                        <span
                          aria-hidden
                          className="material-symbols-outlined text-[12px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        Featured
                      </span>
                    )}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-error text-on-error">
                        Sale
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-x-4 bottom-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                    {product.stock !== "sold-out" && (
                      <button
                        type="button"
                        onClick={() => {
                          addItem({
                            slug: product.slug,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            alt: product.alt,
                          });
                          toast(`Added ${product.name} to cart`, "success");
                        }}
                        className="w-full py-2.5 bg-primary text-on-primary rounded-full font-body text-label-md shadow-lg hover:bg-primary/90 transition-colors"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-headline text-headline-sm text-on-surface">
                    {product.name}
                  </h3>
                  <p className="font-body text-label-md mt-1 flex items-center gap-2">
                    <span className="text-on-surface-variant">{formatPHP(product.price)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-outline line-through">
                        {formatPHP(product.compareAtPrice)}
                      </span>
                    )}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-surface-container-high hover:border-primary text-on-surface-variant transition-colors disabled:opacity-40 disabled:hover:border-surface-container-high"
            >
              <span className="material-symbols-outlined" aria-hidden>
                chevron_left
              </span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-label={`Page ${n}`}
                aria-current={n === currentPage ? "page" : undefined}
                className={`w-10 h-10 flex items-center justify-center rounded-full font-body text-label-md transition-colors ${
                  n === currentPage
                    ? "bg-primary text-on-primary"
                    : "border border-transparent hover:bg-surface-container-low text-on-surface-variant"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-surface-container-high hover:border-primary text-on-surface-variant transition-colors disabled:opacity-40 disabled:hover:border-surface-container-high"
            >
              <span className="material-symbols-outlined" aria-hidden>
                chevron_right
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
