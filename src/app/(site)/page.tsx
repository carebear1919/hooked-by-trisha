import Image from "next/image";
import Link from "next/link";
import { formatPHP, getCategories, getPublishedProducts, PLACEHOLDER_IMAGE } from "@/lib/products";
import { getPayloadClient } from "@/lib/payload";
import NewsletterForm from "@/components/storefront/NewsletterForm";
import WishlistHeartButton from "@/components/storefront/WishlistHeartButton";
import CmsBlocks from "@/components/storefront/CmsBlocks";
import { getHomeLayout } from "@/lib/site-pages";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  const payload = await getPayloadClient();
  const [products, categories, settings, cmsBlocks] = await Promise.all([
    getPublishedProducts(),
    getCategories(),
    payload.findGlobal({ slug: "site-settings", depth: 1 }),
    getHomeLayout({ preview: isPreview }),
  ]);

  // Featured products are pinned to the front of New Arrivals (stable sort keeps
  // recency order within each group), so the admin's "Featured" flag actually does something.
  const featuredFirst = [...products].sort((a, b) => Number(b.featured) - Number(a.featured));
  const newArrivals = featuredFirst.slice(0, 4).map((p) => ({
    slug: p.slug,
    name: p.name,
    rawPrice: p.price,
    price: formatPHP(p.price),
    compareAtPrice: p.compareAtPrice,
    featured: p.featured,
    href: `/product/${p.slug}`,
    img: p.image,
    alt: p.alt,
  }));

  const promo = settings.promotions;
  const saleBannerEnabled = promo?.saleBannerEnabled ?? true;
  const discountPercent = promo?.discountPercent ?? 20;
  const promoCategory =
    typeof promo?.category === "object" && promo.category ? promo.category : null;
  const promoHref = promoCategory ? `/shop/${promoCategory.slug}` : "/shop";
  const promoHeadline =
    promo?.headline ||
    `Up to ${discountPercent}% off${promoCategory ? ` ${promoCategory.name}` : ""}`;
  const promoSubtext =
    promo?.subtext ||
    "Limited pieces, handmade in small batches — once they're gone, they're gone.";

  return (
    <>
      {isPreview && (
        <div className="sticky top-0 z-50 bg-tertiary text-on-tertiary text-center py-2 font-body text-label-md uppercase tracking-wider">
          Preview Mode — showing unpublished changes
        </div>
      )}
      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-container-padding pt-12 pb-section-gap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-gutter items-center">
          <div className="flex flex-col items-start space-y-6">
            <span className="font-body text-label-md uppercase tracking-wider text-primary">
              Handmade With Love
            </span>
            <h1 className="font-headline text-display-lg text-on-surface">
              Crafted by Hand,
              <br />
              Made With Heart
            </h1>
            <p className="font-body text-body-lg text-on-surface-variant max-w-md">
              Curated crochet pieces, hand-stitched and delivered to your door.
              Embrace slow living with intentional, handmade craft.
            </p>
            <Link
              href="/shop"
              className="mt-4 px-8 py-3 bg-primary-container text-on-primary-container font-body text-label-md rounded-full hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              Shop the Collection
              <span className="material-symbols-outlined text-sm" aria-hidden>
                arrow_forward
              </span>
            </Link>

            <div className="flex flex-wrap gap-8 mt-8 pt-8 border-t border-surface-variant">
              {[
                { icon: "handshake", title: "Handmade to Order", sub: "Every piece made just for you" },
                { icon: "verified_user", title: "Secure GCash/BPI Payment", sub: "100% protected checkout" },
                { icon: "cached", title: "Easy Returns", sub: "Hassle-free 7-day returns" },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" aria-hidden>
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-body text-label-md text-on-surface">{item.title}</p>
                    <p className="text-sm text-on-surface-variant">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[500px] lg:h-[600px] w-full lg:pl-12">
            <div
              aria-hidden
              className="absolute top-0 right-0 w-4/5 h-[90%] bg-tertiary-fixed rounded-tl-[100px] rounded-br-[100px] rounded-bl-3xl rounded-tr-3xl -z-10"
            />
            <Image
              className="object-cover rounded-3xl shadow-sm border-4 border-surface"
              alt="A handmade cream crochet tote bag with a simple stitched texture, resting on a neutral surface."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADo0RsfGjKz6S1YdBW6gEFsWPvG3ItoHGRcuhbhXs7ob_1BvOavVgCoRPrNtHcPRs0moHUHa4mMXCIRcKHX3lU_KjzI4XbNrE7Gp55mP3k-UUziViW3fxMc_0AMLMEwpzyFLNXpkjlMP12F4uzDgud5iOKERECUv-snLgMfJ-gmWN3e-TDZsOELfwuQ2YogRcNOO1vw7b9xa3f6tRjiqoRAzkUV1aI1dFjpRgtDCI4LfQDO0SWM-z1HfPQ-WJVbhHVgkMMvxxKrBs"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-[1280px] mx-auto px-container-padding py-12">
        <div className="bg-surface-container-low rounded-xl p-8 lg:p-12">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline text-headline-md text-on-surface">Shop by Category</h2>
            <Link
              href="/shop"
              className="font-body text-label-md text-primary flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              Browse all
              <span className="material-symbols-outlined text-sm" aria-hidden>
                arrow_forward
              </span>
            </Link>
          </div>
          {categories.length === 0 ? (
            <p className="font-body text-body-md text-on-surface-variant py-8 text-center">
              No categories yet — add one in the admin panel.
            </p>
          ) : (
            <div className="flex overflow-x-auto hide-scrollbar gap-8 pb-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop/${cat.slug}`}
                  className="flex flex-col items-center gap-4 group min-w-[140px]"
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary-container relative group-hover:-translate-y-1 transition-transform duration-300">
                    <Image
                      className="object-cover"
                      alt={cat.name}
                      src={cat.image ?? PLACEHOLDER_IMAGE}
                      fill
                      sizes="128px"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-body text-label-md text-on-surface">{cat.name}</h3>
                    <p className="text-sm text-on-surface-variant">
                      {cat.productCount} {cat.productCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      {saleBannerEnabled && (
        <section className="max-w-[1280px] mx-auto px-container-padding py-12">
          <div className="bg-primary rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-on-primary">
            <div>
              <span className="font-body text-label-md uppercase tracking-wider text-primary-fixed">
                Seasonal Sale
              </span>
              <h2 className="font-headline text-headline-md mt-2">{promoHeadline}</h2>
              <p className="mt-2 text-on-primary/80 max-w-md">{promoSubtext}</p>
            </div>
            <Link
              href={promoHref}
              className="px-8 py-3 bg-surface text-primary font-body text-label-md rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Shop the Sale
            </Link>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="max-w-[1280px] mx-auto px-container-padding py-section-gap">
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-headline text-headline-md text-on-surface">New Arrivals</h2>
          <Link
            href="/shop"
            className="font-body text-label-md text-primary flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            View all
            <span className="material-symbols-outlined text-sm" aria-hidden>
              arrow_forward
            </span>
          </Link>
        </div>
        {newArrivals.length === 0 ? (
          <p className="font-body text-body-md text-on-surface-variant py-12 text-center">
            No products yet — check back soon.
          </p>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <div key={product.name} className="group relative flex flex-col gap-3">
              <div className="relative w-full aspect-4/5 bg-surface-container-low rounded-md overflow-hidden">
                <Link href={product.href} tabIndex={-1} aria-hidden className="absolute inset-0 z-0">
                  <Image
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={product.alt}
                    src={product.img}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                </Link>
                <WishlistHeartButton
                  product={{ slug: product.slug, name: product.name, price: product.rawPrice, image: product.img, alt: product.alt }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-surface rounded-full flex items-center justify-center text-on-surface shadow-sm hover:text-error transition-colors"
                />
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                  {product.featured && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tertiary text-on-tertiary">
                      <span aria-hidden className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      Featured
                    </span>
                  )}
                  {product.compareAtPrice && product.compareAtPrice > product.rawPrice && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-error text-on-error">
                      Sale
                    </span>
                  )}
                </div>
              </div>
              <Link href={product.href}>
                <h3 className="font-headline text-headline-sm text-on-surface">{product.name}</h3>
                <p className="font-body text-label-md mt-1 flex items-center gap-2">
                  <span className="text-on-surface-variant">{product.price}</span>
                  {product.compareAtPrice && product.compareAtPrice > product.rawPrice && (
                    <span className="text-outline line-through">{formatPHP(product.compareAtPrice)}</span>
                  )}
                </p>
              </Link>
            </div>
          ))}
        </div>
        )}
      </section>

      <CmsBlocks blocks={cmsBlocks} />

      {/* Newsletter band */}
      <section className="max-w-[1280px] mx-auto px-container-padding pb-12">
        <div className="bg-tertiary-fixed rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-surface rounded-md flex items-center justify-center text-tertiary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-3xl" aria-hidden>
                mail
              </span>
            </div>
            <div>
              <h3 className="font-headline text-headline-sm text-on-tertiary-container">
                Join the Hooked Circle
              </h3>
              <p className="text-on-tertiary-container/80 mt-1 max-w-sm">
                Be the first to know about new arrivals, sales, and behind-the-scenes crafting.
              </p>
            </div>
          </div>
          <NewsletterForm
            idPrefix="home"
            formClassName="flex w-full md:w-auto gap-2 bg-surface p-2 rounded-full shadow-sm flex-1 max-w-md"
            inputClassName="flex-1 bg-transparent border-none focus:ring-0 text-on-surface px-4 py-2 placeholder:text-on-surface-variant/50"
            buttonClassName="bg-tertiary text-on-tertiary font-body text-label-md px-6 py-3 rounded-full hover:bg-tertiary/90 transition-colors whitespace-nowrap"
          />
        </div>
      </section>
    </>
  );
}
