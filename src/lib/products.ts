import "server-only";

import { getPayloadClient, lexicalToText } from "./payload";
import { formatPHP, stockLabel, type StockStatus } from "./format";

export { formatPHP, stockLabel };
export type { StockStatus };

export type Category = {
  slug: string;
  name: string;
  description: string;
  image?: string;
  productCount: number;
};

export type Product = {
  slug: string;
  name: string;
  category: string; // Category slug
  price: number; // PHP
  compareAtPrice?: number; // PHP
  stock: StockStatus;
  description: string;
  materialsCare: string;
  shippingReturns: string;
  image: string;
  alt: string;
  gallery?: { src: string; alt: string }[];
  featured: boolean;
};

export const PLACEHOLDER_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD7X7ME7h709mVx-K_iL3JesOzRjuYFhtCQrSyGxXIYqM9I2q6XC5-uKIU-pz_UcGlFYYDV3n6go8cPshB4KskoT4yoYcMmfTj9I83MO1tf42hW0kDgJ1srf2PQw7jjrN63wCnMNSbFsiKccEWYSLqVytlYNf3FCfrtwY9IPGkI1QslGJLLXmOgmRWfxRNOxzavGYELJBLqdGx7fLwLyGCLhpFdm7I3uf0QUDUymnvM1RYADuEacrU_KAvJDPQyRue_Rb-1cthIgMo";

function stockStatusFor(stock: number): StockStatus {
  if (stock <= 0) return "sold-out";
  if (stock <= 5) return "low-stock";
  return "in-stock";
}

type PayloadMedia = { url?: string | null; alt?: string | null } | number | null | undefined;

function mediaSrc(media: PayloadMedia): string | undefined {
  return typeof media === "object" && media ? (media.url ?? undefined) : undefined;
}

function mediaAlt(media: PayloadMedia, fallback: string): string {
  return (typeof media === "object" && media?.alt) || fallback;
}

// Minimal shape of what we read off a Payload product doc — avoids depending on generated types.
type PayloadProduct = {
  id: number | string;
  name: string;
  slug: string;
  category: { slug?: string; name?: string } | number | string | null;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  description?: unknown;
  materialsCare?: string | null;
  shippingReturns?: string | null;
  photos?: PayloadMedia[] | null;
  featured?: boolean | null;
};

function toProduct(doc: PayloadProduct): Product {
  const categorySlug = typeof doc.category === "object" && doc.category ? doc.category.slug ?? "" : "";
  const photos = doc.photos ?? [];
  const gallery = photos
    .map((p) => {
      const src = mediaSrc(p);
      return src ? { src, alt: mediaAlt(p, doc.name) } : null;
    })
    .filter((g): g is { src: string; alt: string } => Boolean(g));

  return {
    slug: doc.slug,
    name: doc.name,
    category: categorySlug,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice ?? undefined,
    stock: stockStatusFor(doc.stock),
    description: lexicalToText(doc.description) || "",
    materialsCare: doc.materialsCare ?? "",
    shippingReturns: doc.shippingReturns ?? "",
    image: gallery[0]?.src ?? PLACEHOLDER_IMAGE,
    alt: gallery[0]?.alt ?? doc.name,
    gallery: gallery.length > 0 ? gallery : undefined,
    featured: doc.featured ?? false,
  };
}

type PayloadCategory = {
  id: number | string;
  slug: string;
  name: string;
  description?: string | null;
  image?: PayloadMedia;
};

async function countsByCategory(payload: Awaited<ReturnType<typeof getPayloadClient>>) {
  const { docs } = await payload.find({
    collection: "products",
    where: { status: { equals: "published" } },
    depth: 0,
    limit: 1000,
  });
  const counts = new Map<string, number>();
  for (const doc of docs as unknown as { category: number | string | null }[]) {
    if (doc.category == null) continue;
    const key = String(doc.category);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function toCategory(doc: PayloadCategory, count: number): Category {
  return {
    slug: doc.slug,
    name: doc.name,
    description: doc.description ?? "",
    image: mediaSrc(doc.image),
    productCount: count,
  };
}

export async function getCategories(): Promise<Category[]> {
  const payload = await getPayloadClient();
  const [{ docs }, counts] = await Promise.all([
    payload.find({ collection: "categories", sort: "name", depth: 1, limit: 100 }),
    countsByCategory(payload),
  ]);
  return (docs as unknown as PayloadCategory[]).map((c) =>
    toCategory(c, counts.get(String(c.id)) ?? 0)
  );
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const payload = await getPayloadClient();
  const [{ docs }, counts] = await Promise.all([
    payload.find({
      collection: "categories",
      where: { slug: { equals: slug } },
      depth: 1,
      limit: 1,
    }),
    countsByCategory(payload),
  ]);
  const doc = docs[0] as unknown as PayloadCategory | undefined;
  return doc ? toCategory(doc, counts.get(String(doc.id)) ?? 0) : null;
}

type PromoConfig = { enabled: boolean; discountPercent: number; categorySlug: string | null };

async function getPromoConfig(payload: Awaited<ReturnType<typeof getPayloadClient>>): Promise<PromoConfig> {
  const settings = await payload.findGlobal({ slug: "site-settings", depth: 1 });
  const promo = settings.promotions;
  const category = promo?.category;
  const categorySlug = typeof category === "object" && category ? (category.slug ?? null) : null;
  return {
    enabled: promo?.saleBannerEnabled ?? false,
    discountPercent: promo?.discountPercent ?? 0,
    categorySlug,
  };
}

// Sale-banner discount (Settings → Promotions) overrides a product's own price
// when active, rather than layering on top of a manually-set compareAtPrice.
function applyPromo(product: Product, promo: PromoConfig): Product {
  if (!promo.enabled || promo.discountPercent <= 0) return product;
  if (promo.categorySlug && product.category !== promo.categorySlug) return product;
  const discounted = Math.round(product.price * (1 - promo.discountPercent / 100));
  if (discounted >= product.price) return product;
  return { ...product, price: discounted, compareAtPrice: product.price };
}

export async function getPublishedProducts(): Promise<Product[]> {
  const payload = await getPayloadClient();
  const [{ docs }, promo] = await Promise.all([
    payload.find({
      collection: "products",
      where: { status: { equals: "published" } },
      depth: 2,
      sort: "-createdAt",
      limit: 200,
    }),
    getPromoConfig(payload),
  ]);
  return (docs as unknown as PayloadProduct[]).map(toProduct).map((p) => applyPromo(p, promo));
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await getPublishedProducts();
  return products.filter((p) => p.category === categorySlug);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const payload = await getPayloadClient();
  const [{ docs }, promo] = await Promise.all([
    payload.find({
      collection: "products",
      where: { slug: { equals: slug }, status: { equals: "published" } },
      depth: 2,
      limit: 1,
    }),
    getPromoConfig(payload),
  ]);
  const doc = docs[0] as unknown as PayloadProduct | undefined;
  return doc ? applyPromo(toProduct(doc), promo) : null;
}

export async function getRelatedProducts(product: Product, count = 4): Promise<Product[]> {
  const products = await getPublishedProducts();
  const sameCategory = products.filter((p) => p.category === product.category && p.slug !== product.slug);
  const rest = products.filter((p) => p.category !== product.category && p.slug !== product.slug);
  return [...sameCategory, ...rest].slice(0, count);
}
