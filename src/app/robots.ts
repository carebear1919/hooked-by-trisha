import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/cms-admin", "/api", "/cart", "/checkout", "/order-confirmation"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
