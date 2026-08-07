import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/storefront/ProductGrid";
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/products";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};

  const title = `${category.name} | Hooked by Trisha`;
  const description =
    category.description || `Shop handmade ${category.name.toLowerCase()} from Hooked by Trisha.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: category.image ? [{ url: category.image }] : undefined,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { category: categorySlug } = await params;
  const { search } = await searchParams;
  const [category, categories] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category.slug);

  return (
    <div>
      {/* Category Banner */}
      <section className="relative overflow-hidden bg-surface-container-low pt-12 pb-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-container-padding grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 space-y-6">
            <div className="inline-block px-4 py-1 rounded-full bg-primary-container text-on-primary-container font-body text-label-md uppercase tracking-wider">
              Category
            </div>
            <h1 className="font-headline text-display-lg text-primary leading-tight">
              {category.name}
            </h1>
            <p className="font-body text-body-lg text-on-surface-variant max-w-lg">
              {category.description}
            </p>
            <nav className="flex text-label-md font-body text-on-surface-variant uppercase">
              <Link className="hover:text-primary transition-colors" href="/">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link
                className="hover:text-primary transition-colors"
                href="/shop"
              >
                Shop
              </Link>
              <span className="mx-2">/</span>
              <span className="text-primary font-bold">{category.name}</span>
            </nav>
          </div>
          <div className="relative flex justify-center items-center">
            <div
              aria-hidden
              className="absolute -z-10 w-full h-full max-w-[500px] max-h-[500px] bg-tertiary-fixed opacity-40 rounded-[64%_36%_27%_73%/55%_58%_42%_45%]"
            />
            <div className="relative w-full aspect-4/5 rounded-[40px] overflow-hidden shadow-xl">
              <Image
                className="object-cover"
                alt={products[0]?.alt ?? `${category.name} products from Hooked by Trisha.`}
                src={
                  products[0]?.image ??
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuD7X7ME7h709mVx-K_iL3JesOzRjuYFhtCQrSyGxXIYqM9I2q6XC5-uKIU-pz_UcGlFYYDV3n6go8cPshB4KskoT4yoYcMmfTj9I83MO1tf42hW0kDgJ1srf2PQw7jjrN63wCnMNSbFsiKccEWYSLqVytlYNf3FCfrtwY9IPGkI1QslGJLLXmOgmRWfxRNOxzavGYELJBLqdGx7fLwLyGCLhpFdm7I3uf0QUDUymnvM1RYADuEacrU_KAvJDPQyRue_Rb-1cthIgMo"
                }
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="max-w-[1280px] mx-auto px-container-padding py-section-gap">
        <ProductGrid
          products={products}
          categories={categories}
          lockedCategory={category.slug}
          initialSearch={search}
        />
      </section>

      {/* Custom Order CTA */}
      <section className="bg-secondary-container/30 py-section-gap">
        <div className="max-w-[800px] mx-auto px-container-padding text-center space-y-6">
          <h2 className="font-headline text-headline-lg text-primary">
            Can&apos;t find your perfect piece?
          </h2>
          <p className="font-body text-body-lg text-on-surface-variant">
            We love bringing new ideas to life. Reach out for a custom
            commission and let&apos;s design your one-of-a-kind piece
            together.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-primary text-on-primary font-body text-label-md rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            Request Custom Order
          </Link>
        </div>
      </section>
    </div>
  );
}
