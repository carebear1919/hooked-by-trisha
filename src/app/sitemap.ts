import type { MetadataRoute } from "next";
import { getCategories, getPublishedProducts } from "@/lib/products";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getPublishedProducts(), getCategories()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/wishlist`, changeFrequency: "monthly", priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${APP_URL}/shop/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${APP_URL}/product/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
