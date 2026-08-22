"use client";

import { useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";

const TAB_GROUPS: { label: string; tabs: { name: Tab; icon: string }[] }[] = [
  {
    label: "Store",
    tabs: [
      { name: "General", icon: "storefront" },
      { name: "Social Links", icon: "share" },
    ],
  },
  {
    label: "Selling",
    tabs: [
      { name: "Payment Details", icon: "payments" },
      { name: "Shipping", icon: "local_shipping" },
      { name: "Promotions", icon: "sell" },
    ],
  },
  {
    label: "Support",
    tabs: [
      { name: "Policies", icon: "gavel" },
      { name: "Notifications", icon: "notifications" },
    ],
  },
];

const TAB_META: Record<
  Tab,
  { heading: string; description: string }
> = {
  General: {
    heading: "Store Identity",
    description: "How your shop is named and branded across the site.",
  },
  "Payment Details": {
    heading: "Payment Details",
    description: "Where customers send manual payments, and what they see at checkout.",
  },
  Shipping: {
    heading: "Shipping & Pickup",
    description: "Delivery fees and pickup info shown at checkout.",
  },
  "Social Links": {
    heading: "Social Links",
    description: "Shown in the footer. Leave any blank to hide that icon.",
  },
  Promotions: {
    heading: "Promotions",
    description: "The sale banner shown on the homepage between Shop by Category and New Arrivals.",
  },
  Policies: {
    heading: "Policies",
    description: "Store-wide policy text referenced across the storefront.",
  },
  Notifications: {
    heading: "Notifications",
    description: "Where administrative alerts and contact form messages go.",
  },
};

export type Tab =
  | "General"
  | "Payment Details"
  | "Shipping"
  | "Social Links"
  | "Promotions"
  | "Policies"
  | "Notifications";

type SiteSettingsData = {
  shopName?: string | null;
  creatorName?: string | null;
  logo?: { id: number | string } | number | string | null;
  payment?: {
    gcashNumber?: string | null;
    gcashQrCode?: { id: number | string } | number | string | null;
    bpiAccountName?: string | null;
    bpiAccountNumber?: string | null;
  } | null;
  shipping?: {
    standardFee?: number | null;
    freeShippingThreshold?: number | null;
    pickupLocation?: string | null;
  } | null;
  social?: {
    showSocialLinks?: boolean | null;
    instagram?: string | null;
    showInstagram?: boolean | null;
    facebook?: string | null;
    showFacebook?: boolean | null;
    tiktok?: string | null;
    showTiktok?: boolean | null;
  } | null;
  contactEmail?: string | null;
  promotions?: {
    saleBannerEnabled?: boolean | null;
    discountPercent?: number | null;
    category?: { id: number | string } | number | string | null;
    headline?: string | null;
    subtext?: string | null;
  } | null;
};

type CategoryOption = { id: number | string; name: string };
type MediaOption = {
  id: number | string;
  url?: string | null;
  thumbnailURL?: string | null;
  title?: string | null;
  filename?: string | null;
};

function relationId(value: unknown): string {
  if (typeof value === "object" && value && "id" in value) return String((value as { id: unknown }).id);
  return value ? String(value) : "";
}

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 py-6 border-b border-outline-variant/15 last:border-0">
      <div className="md:col-span-4">
        <p className="font-body text-body-md font-bold text-on-surface">{title}</p>
        {description && <p className="mt-1 text-sm text-on-surface-variant">{description}</p>}
      </div>
      <div className="md:col-span-8 max-w-lg">{children}</div>
    </div>
  );
}

function SocialLinkField({
  urlName,
  showName,
  defaultUrl,
  defaultShow,
  placeholder,
}: {
  urlName: string;
  showName: string;
  defaultUrl: string;
  defaultShow: boolean;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Input name={urlName} defaultValue={defaultUrl} placeholder={placeholder} className="px-4 flex-1" />
      <label
        title="Show this link in the footer"
        className="flex items-center gap-2 shrink-0 cursor-pointer text-on-surface-variant"
      >
        <input type="checkbox" name={showName} defaultChecked={defaultShow} className="h-5 w-5 accent-primary" />
        <span className="text-sm">Show</span>
      </label>
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-surface-container-low border-none rounded-md py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/45 placeholder:italic focus:ring-2 focus:ring-primary ${className ?? "px-4"}`}
    />
  );
}

export default function SettingsForm({
  action,
  settings,
  categories,
  mediaOptions,
  returnPolicyText,
}: {
  action: (formData: FormData) => void;
  settings: SiteSettingsData;
  categories: CategoryOption[];
  mediaOptions: MediaOption[];
  returnPolicyText: string;
}) {
  const promoCategory = settings.promotions?.category;
  const currentCategoryId: string | number =
    typeof promoCategory === "object" && promoCategory ? promoCategory.id : (promoCategory ?? "");
  const [tab, setTab] = useState<Tab>("General");

  return (
    <form id="settings-form" action={action} className="p-6 md:p-8 flex flex-col md:flex-row gap-8 w-full">
      <nav className="flex md:flex-col gap-6 md:w-56 shrink-0">
        {TAB_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-4 mb-1 font-body text-label-md uppercase tracking-widest text-on-surface-variant/60">
              {group.label}
            </p>
            <div className="flex md:flex-col gap-1 overflow-x-auto">
              {group.tabs.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setTab(t.name)}
                  className={`flex items-center gap-3 text-left whitespace-nowrap px-4 py-2.5 rounded-md font-body text-body-md transition-colors ${
                    tab === t.name
                      ? "bg-primary-container/15 text-primary font-medium"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <span aria-hidden className="material-symbols-outlined text-xl shrink-0">
                    {t.icon}
                  </span>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 md:p-10 min-w-0">
        <div className="mb-6 pb-6 border-b border-outline-variant/20">
          <h2 className="font-headline text-headline-sm text-on-surface">{TAB_META[tab].heading}</h2>
          <p className="mt-1 font-body text-body-md text-on-surface-variant">{TAB_META[tab].description}</p>
        </div>

        <div className={tab === "General" ? "" : "hidden"}>
          <Row title="Shop Name" description="Shown in the header and browser tab.">
            <Input name="shopName" defaultValue={settings.shopName ?? ""} placeholder="Handmade Crochet Co." />
          </Row>
          <Row title="Creator Name" description={'Optional — shown as "by {name}" in the footer and admin panel. Leave blank to stay unbranded.'}>
            <Input name="creatorName" defaultValue={settings.creatorName ?? ""} placeholder="e.g. Maria" />
          </Row>
          <Row title="Logo" description="A square image works best.">
            <MediaPicker
              fieldName="logo"
              mediaOptions={mediaOptions}
              initialSelectedIds={relationId(settings.logo) ? [relationId(settings.logo)] : []}
            />
          </Row>
        </div>

        <div className={tab === "Payment Details" ? "" : "hidden"}>
          <Row title="GCash Number" description="Shown on the manual-payment fallback screen.">
            <Input name="gcashNumber" defaultValue={settings.payment?.gcashNumber ?? ""} placeholder="09XX XXX XXXX" />
          </Row>
          <Row title="GCash QR Code" description="Shown for customers paying manually via GCash.">
            <MediaPicker
              fieldName="gcashQrCode"
              mediaOptions={mediaOptions}
              initialSelectedIds={
                relationId(settings.payment?.gcashQrCode) ? [relationId(settings.payment?.gcashQrCode)] : []
              }
            />
          </Row>
          <Row title="BPI Account Name">
            <Input
              name="bpiAccountName"
              defaultValue={settings.payment?.bpiAccountName ?? ""}
              placeholder="Juan Dela Cruz"
            />
          </Row>
          <Row title="BPI Account Number">
            <Input
              name="bpiAccountNumber"
              defaultValue={settings.payment?.bpiAccountNumber ?? ""}
              placeholder="XXXX XXXXXX XXXX"
            />
          </Row>
        </div>

        <div className={tab === "Shipping" ? "" : "hidden"}>
          <Row title="Standard Shipping Fee" description="Charged on standard delivery orders.">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">₱</span>
              <Input
                name="standardFee"
                type="number"
                defaultValue={settings.shipping?.standardFee ?? 150}
                className="pl-9 pr-4"
              />
            </div>
          </Row>
          <Row
            title="Free Shipping Threshold"
            description="Orders at or above this subtotal ship free. Leave blank to disable."
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">₱</span>
              <Input
                name="freeShippingThreshold"
                type="number"
                defaultValue={settings.shipping?.freeShippingThreshold ?? ""}
                className="pl-9 pr-4"
              />
            </div>
          </Row>
          <Row title="Pickup Location" description="Shown as the address for local pickup orders.">
            <Input
              name="pickupLocation"
              defaultValue={settings.shipping?.pickupLocation ?? ""}
              placeholder="Quezon City, Philippines"
            />
          </Row>
        </div>

        <div className={tab === "Social Links" ? "" : "hidden"}>
          <Row title="Show Social Links" description="Turn off to hide the whole row from the footer.">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="showSocialLinks"
                defaultChecked={settings.social?.showSocialLinks ?? true}
                className="h-5 w-5 accent-primary"
              />
              <span className="font-body text-body-md text-on-surface">Show in footer</span>
            </label>
          </Row>
          <Row title="Instagram">
            <SocialLinkField
              urlName="instagram"
              showName="showInstagram"
              defaultUrl={settings.social?.instagram ?? ""}
              defaultShow={settings.social?.showInstagram ?? true}
              placeholder="https://instagram.com/yourshop"
            />
          </Row>
          <Row title="Facebook">
            <SocialLinkField
              urlName="facebook"
              showName="showFacebook"
              defaultUrl={settings.social?.facebook ?? ""}
              defaultShow={settings.social?.showFacebook ?? true}
              placeholder="https://facebook.com/yourshop"
            />
          </Row>
          <Row title="TikTok">
            <SocialLinkField
              urlName="tiktok"
              showName="showTiktok"
              defaultUrl={settings.social?.tiktok ?? ""}
              defaultShow={settings.social?.showTiktok ?? true}
              placeholder="https://tiktok.com/@yourshop"
            />
          </Row>
        </div>

        <div className={tab === "Promotions" ? "" : "hidden"}>
          <Row title="Sale Banner" description="Turn off to hide the banner without deleting anything.">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="saleBannerEnabled"
                defaultChecked={settings.promotions?.saleBannerEnabled ?? true}
                className="h-5 w-5 accent-primary"
              />
              <span className="font-body text-body-md text-on-surface">Show on homepage</span>
            </label>
          </Row>
          <Row title="Discount Percentage" description='Used in the auto-generated headline, e.g. "Up to 20% off".'>
            <div className="relative">
              <Input
                name="discountPercent"
                type="number"
                min={1}
                max={100}
                defaultValue={settings.promotions?.discountPercent ?? 20}
                className="pl-4 pr-9"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">%</span>
            </div>
          </Row>
          <Row title="Applies To Category" description="Links the banner. Leave as All to link to /shop.">
            <select
              name="promoCategory"
              defaultValue={currentCategoryId}
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
            >
              <option value="">All products (links to /shop)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Row>
          <Row title="Headline Override" description="Leave blank to auto-generate from the percentage and category.">
            <Input name="promoHeadline" defaultValue={settings.promotions?.headline ?? ""} />
          </Row>
          <Row title="Supporting Text Override">
            <textarea
              name="promoSubtext"
              rows={3}
              defaultValue={settings.promotions?.subtext ?? ""}
              placeholder="Limited pieces, handmade in small batches — once they're gone, they're gone."
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
            />
          </Row>
        </div>

        <div className={tab === "Policies" ? "" : "hidden"}>
          <Row title="Return Policy" description="Shown on the storefront wherever your return policy is referenced.">
            <textarea
              name="returnPolicy"
              rows={12}
              defaultValue={returnPolicyText}
              placeholder="e.g. We accept returns within 7 days of delivery for unused items in original packaging..."
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
            />
          </Row>
        </div>

        <div className={tab === "Notifications" ? "" : "hidden"}>
          <Row title="Contact Email" description="Where contact form submissions and order alerts are sent.">
            <Input name="contactEmail" type="email" defaultValue={settings.contactEmail ?? ""} placeholder="hello@example.com" />
          </Row>
          <p className="mt-2 font-body text-body-md text-on-surface-variant">
            Manage which events send an email in Notifications settings.
          </p>
        </div>
      </div>
    </form>
  );
}
