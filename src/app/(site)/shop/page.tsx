import Link from "next/link";
import ProductGrid from "@/components/storefront/ProductGrid";
import { getCategories, getPublishedProducts } from "@/lib/products";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const [products, categories] = await Promise.all([getPublishedProducts(), getCategories()]);

  return (
    <div className="max-w-[1280px] mx-auto px-container-padding">
      <section className="py-12 border-b border-surface-container-high">
        <nav className="flex text-label-md font-body text-on-surface-variant mb-4 uppercase">
          <Link className="hover:text-primary transition-colors" href="/">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-bold">Shop</span>
        </nav>
        <h1 className="font-headline text-headline-lg text-primary mb-4">
          Shop All
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Discover our curated collection of artisanal crochet pieces. Each
          item is hand-stitched with premium fibers, designed to bring
          tactile warmth and intentional beauty into your daily life.
        </p>
      </section>

      <section className="py-10">
        <ProductGrid products={products} categories={categories} initialSearch={search} />
      </section>
    </div>
  );
}
