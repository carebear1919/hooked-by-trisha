import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "../globals.css";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/lib/toast-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { getPayloadClient } from "@/lib/payload";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Handmade Crochet Co. | Handmade Crochet",
  description:
    "Handmade crochet bags, amigurumi, blankets, and accessories, crafted by hand in the Philippines.",
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({ slug: "site-settings", depth: 1 });
  const shopName = settings.shopName || "Handmade Crochet Co.";
  const logo = settings.logo;
  const logoUrl = logo && typeof logo === "object" ? (logo.url ?? null) : null;

  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-body bg-surface text-on-surface">
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <Header shopName={shopName} logoUrl={logoUrl} />
              <main className="flex-1">{children}</main>
              <Footer shopName={shopName} creatorName={settings.creatorName ?? undefined} social={settings.social} />
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
