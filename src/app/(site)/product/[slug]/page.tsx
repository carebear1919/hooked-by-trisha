import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductActions from "@/components/storefront/ProductActions";
import ProductGallery from "@/components/storefront/ProductGallery";
import WishlistHeartButton from "@/components/storefront/WishlistHeartButton";
import { getPayloadClient, lexicalToText } from "@/lib/payload";
import {
  formatPHP,
  getCategoryBySlug,
  getProductBySlug,
  getPublishedProducts,
  getRelatedProducts,
  stockLabel,
} from "@/lib/products";

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = `${product.name} | Hooked by Trisha`;
  const description = product.description || `${product.name} — handmade crochet from Hooked by Trisha.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = await getCategoryBySlug(product.category);
  const gallery = product.gallery ?? [{ src: product.image, alt: product.alt }];
  const related = await getRelatedProducts(product);

  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({ slug: "site-settings" });
  const shippingReturnsText = product.shippingReturns || lexicalToText(settings.returnPolicy);

  return (
    <div className="max-w-[1280px] mx-auto px-container-padding py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex flex-wrap items-center gap-2 font-body text-label-md text-on-surface-variant">
        <Link className="hover:text-primary transition-colors" href="/">
          Home
        </Link>
        <span className="material-symbols-outlined text-[14px]" aria-hidden>
          chevron_right
        </span>
        <Link className="hover:text-primary transition-colors" href="/shop">
          Shop
        </Link>
        {category && (
          <>
            <span className="material-symbols-outlined text-[14px]" aria-hidden>
              chevron_right
            </span>
            <Link
              className="hover:text-primary transition-colors"
              href={`/shop/${category.slug}`}
            >
              {category.name}
            </Link>
          </>
        )}
        <span className="material-symbols-outlined text-[14px]" aria-hidden>
          chevron_right
        </span>
        <span className="text-on-surface">{product.name}</span>
      </nav>

      {/* Product Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-section-gap">
        <ProductGallery images={gallery} />

        <div className="flex flex-col">
          <h1 className="font-headline text-headline-lg text-on-surface mb-4">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-headline text-headline-sm text-primary">
              {formatPHP(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-on-surface-variant line-through font-body text-body-md">
                {formatPHP(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-8">
            <span
              className={`w-3 h-3 rounded-full ${
                product.stock === "sold-out"
                  ? "bg-error"
                  : product.stock === "low-stock"
                    ? "bg-tertiary"
                    : "bg-primary animate-pulse"
              }`}
              aria-hidden
            />
            <span className="text-on-surface-variant font-body text-body-md italic">
              {product.stock === "sold-out"
                ? "Currently Sold Out"
                : product.stock === "low-stock"
                  ? "Low Stock — Order Soon"
                  : "In Stock & Ready to Ship"}
            </span>
            <span className="sr-only">{stockLabel(product.stock)}</span>
          </div>

          <p className="text-on-surface-variant font-body text-body-md mb-8 leading-relaxed">
            {product.description}
          </p>

          <ProductActions
            product={{
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.image,
              alt: product.alt,
            }}
            stock={product.stock}
          />

          {/* Accordions */}
          <div className="border-t border-surface-container-high divide-y divide-surface-container-high">
            <details className="group py-4" open>
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <span className="font-body text-label-md uppercase tracking-widest text-on-surface">
                  Description
                </span>
                <span
                  className="material-symbols-outlined group-open:rotate-180 transition-transform"
                  aria-hidden
                >
                  expand_more
                </span>
              </summary>
              <div className="pt-4 text-on-surface-variant font-body text-body-md space-y-3">
                <p>{product.description}</p>
              </div>
            </details>
            {product.materialsCare && (
              <details className="group py-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="font-body text-label-md uppercase tracking-widest text-on-surface">
                    Materials &amp; Care
                  </span>
                  <span
                    className="material-symbols-outlined group-open:rotate-180 transition-transform"
                    aria-hidden
                  >
                    expand_more
                  </span>
                </summary>
                <div className="pt-4 text-on-surface-variant font-body text-body-md">
                  <p>{product.materialsCare}</p>
                </div>
              </details>
            )}
            {shippingReturnsText && (
              <details className="group py-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="font-body text-label-md uppercase tracking-widest text-on-surface">
                    Shipping &amp; Returns
                  </span>
                  <span
                    className="material-symbols-outlined group-open:rotate-180 transition-transform"
                    aria-hidden
                  >
                    expand_more
                  </span>
                </summary>
                <div className="pt-4 text-on-surface-variant font-body text-body-md whitespace-pre-line">
                  <p>{shippingReturnsText}</p>
                </div>
              </details>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-section-gap">
          <h2 className="font-headline text-headline-sm text-on-surface mb-8 border-b border-surface-container-high pb-4">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
            {related.map((item) => (
              <div key={item.slug} className="group relative">
                <Link href={`/product/${item.slug}`} className="cursor-pointer block">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-container-low mb-4">
                    <Image
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                    />
                  </div>
                  <h3 className="font-body text-label-md text-on-surface mb-1">
                    {item.name}
                  </h3>
                  <p className="text-primary font-bold">
                    {formatPHP(item.price)}
                  </p>
                </Link>
                <WishlistHeartButton
                  product={{ slug: item.slug, name: item.name, price: item.price, image: item.image, alt: item.alt }}
                  className="absolute top-3 right-3 z-10 p-2 bg-surface/80 backdrop-blur-sm rounded-full text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
