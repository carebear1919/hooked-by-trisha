import Link from "next/link";
import { getVisibleSocialLinks, type SocialSettings } from "@/lib/social-links";
import NewsletterForm from "./NewsletterForm";

const TRUST_ITEMS = [
  { icon: "verified", label: "Handmade Quality" },
  { icon: "support_agent", label: "Friendly Support" },
  { icon: "favorite", label: "Loved by Customers" },
  { icon: "eco", label: "Sustainable Materials" },
];

const SHOP_LINKS = [
  { href: "/shop", label: "All Products" },
  { href: "/shop", label: "Bags" },
  { href: "/shop", label: "Amigurumi" },
  { href: "/shop", label: "Blankets" },
];

const COMPANY_LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/contact", label: "FAQ" },
];

const SOCIAL_PATHS: Record<string, string> = {
  Instagram:
    "M12 2c-2.72 0-3.06.01-4.12.06-1.06.05-1.78.22-2.41.46a4.87 4.87 0 0 0-1.76 1.15A4.87 4.87 0 0 0 2.52 5.43c-.24.63-.41 1.35-.46 2.41C2.01 8.9 2 9.24 2 12s.01 3.1.06 4.16c.05 1.06.22 1.78.46 2.41.25.65.6 1.2 1.15 1.76.55.55 1.11.9 1.76 1.15.63.24 1.35.41 2.41.46C8.94 22 9.28 22 12 22s3.06-.01 4.12-.06c1.06-.05 1.78-.22 2.41-.46a4.87 4.87 0 0 0 1.76-1.15c.55-.55.9-1.11 1.15-1.76.24-.63.41-1.35.46-2.41.05-1.06.06-1.4.06-4.16s-.01-3.1-.06-4.16c-.05-1.06-.22-1.78-.46-2.41a4.87 4.87 0 0 0-1.15-1.76A4.87 4.87 0 0 0 18.94 2.5c-.63-.24-1.35-.41-2.41-.46C15.47 2.01 15.13 2 12.37 2Zm0 1.8c2.67 0 2.99.01 4.04.06.98.04 1.5.2 1.86.34.47.18.8.4 1.15.75.35.35.57.68.75 1.15.14.36.3.88.34 1.86.05 1.05.06 1.37.06 4.04s-.01 2.99-.06 4.04c-.04.98-.2 1.5-.34 1.86-.18.47-.4.8-.75 1.15-.35.35-.68.57-1.15.75-.36.14-.88.3-1.86.34-1.05.05-1.37.06-4.04.06s-2.99-.01-4.04-.06c-.98-.04-1.5-.2-1.86-.34a3.1 3.1 0 0 1-1.15-.75 3.1 3.1 0 0 1-.75-1.15c-.14-.36-.3-.88-.34-1.86C3.81 14.99 3.8 14.67 3.8 12s.01-2.99.06-4.04c.04-.98.2-1.5.34-1.86.18-.47.4-.8.75-1.15.35-.35.68-.57 1.15-.75.36-.14.88-.3 1.86-.34C9.01 3.81 9.33 3.8 12 3.8Zm0 3.05a5.15 5.15 0 1 0 0 10.3 5.15 5.15 0 0 0 0-10.3Zm0 8.5a3.35 3.35 0 1 1 0-6.7 3.35 3.35 0 0 1 0 6.7Zm5.35-8.7a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z",
  Facebook:
    "M13.5 21v-7.75h2.6l.39-3.02h-3v-1.93c0-.87.24-1.47 1.5-1.47H16.6V3.63C16.3 3.59 15.3 3.5 14.13 3.5c-2.44 0-4.11 1.49-4.11 4.22v2.35H7.4v3.02h2.62V21h3.48Z",
  TikTok: "M16.6 2h-3.2v13.3a2.9 2.9 0 1 1-2.06-2.78v-3.3a6.1 6.1 0 1 0 5.26 6.05V8.9a7.5 7.5 0 0 0 4.4 1.4V7.1a4.3 4.3 0 0 1-4.4-4.1V2Z",
};

export default function Footer({
  shopName = "Hooked by Trisha",
  social,
}: {
  shopName?: string;
  social?: SocialSettings;
}) {
  const socialLinks = getVisibleSocialLinks(social);

  return (
    <footer className="bg-surface-container-low">
      <div className="max-w-[1280px] mx-auto px-container-padding py-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-surface-container-high">
        {TRUST_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span aria-hidden className="material-symbols-outlined text-primary">
              {item.icon}
            </span>
            <span className="font-body text-body-md text-on-surface-variant">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="max-w-[1280px] mx-auto px-container-padding py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="font-headline text-headline-sm font-bold text-on-surface">
            {shopName}
          </Link>
          <p className="mt-3 font-body text-body-md text-on-surface-variant">
            Handmade crochet, crafted with heart in the Philippines.
          </p>
          {socialLinks.length > 0 && (
            <div className="mt-4 flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noreferrer"
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                    <path d={SOCIAL_PATHS[social.label]} />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-body text-label-md uppercase text-on-surface mb-4">Shop</h3>
          <ul className="flex flex-col gap-3">
            {SHOP_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="font-body text-body-md text-on-surface-variant hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-body text-label-md uppercase text-on-surface mb-4">Company</h3>
          <ul className="flex flex-col gap-3">
            {COMPANY_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="font-body text-body-md text-on-surface-variant hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-body text-label-md uppercase text-on-surface mb-4">Stay Updated</h3>
          <p className="font-body text-body-md text-on-surface-variant mb-3">
            Get updates on new pieces and seasonal drops.
          </p>
          <NewsletterForm
            idPrefix="footer"
            formClassName="flex gap-2"
            inputClassName="min-w-0 flex-1 rounded-full border border-outline-variant bg-surface px-4 py-2 font-body text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
            buttonClassName="shrink-0 rounded-full bg-primary text-on-primary px-4 py-2 font-body text-label-md hover:bg-primary-container transition-colors"
          />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-container-padding py-6 border-t border-surface-container-high">
        <p className="font-body text-label-md text-on-surface-variant">
          © {new Date().getFullYear()} {shopName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
