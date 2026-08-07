import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Where } from "payload";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import FlashToast from "@/components/admin/FlashToast";
import Pagination from "@/components/admin/Pagination";
import { getPayloadClient } from "@/lib/payload";
import { deleteProduct } from "../actions";

const PAGE_SIZE = 20;
const TABS = ["All", "Published", "Draft"];

function stockTone(stock: number): { dot: string; text: string; label: string } {
  if (stock <= 0) return { dot: "bg-error", text: "text-error", label: `${stock} Empty` };
  if (stock <= 5) return { dot: "bg-amber-500", text: "text-amber-600", label: `${stock} Low` };
  return { dot: "bg-emerald-500", text: "text-emerald-600", label: `${stock} Healthy` };
}

function tabHref(tab: string, q?: string) {
  const params = new URLSearchParams();
  if (tab !== "All") params.set("status", tab.toLowerCase());
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

export default async function ProductsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}) {
  const { page: pageParam, status, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const activeTab = TABS.find((t) => t.toLowerCase() === status?.toLowerCase()) ?? "All";
  const query = q?.trim();

  const whereClauses: Where[] = [];
  if (activeTab !== "All") whereClauses.push({ status: { equals: activeTab.toLowerCase() } });
  if (query) whereClauses.push({ name: { like: query } });

  const payload = await getPayloadClient();
  const { docs: products, totalDocs, totalPages } = await payload.find({
    collection: "products",
    depth: 1,
    sort: "-createdAt",
    limit: PAGE_SIZE,
    page,
    where: whereClauses.length > 0 ? { and: whereClauses } : undefined,
  });

  return (
    <>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <AdminTopbar
        title="Products"
        actions={
          <Link
            href="/admin/products/new"
            className="bg-primary text-on-primary flex items-center gap-2 px-6 py-2.5 rounded-full font-body text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <span aria-hidden className="material-symbols-outlined text-[20px]">
              add
            </span>
            Add Product
          </Link>
        }
      />
      <div className="p-6 md:p-8 space-y-gutter">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-surface-container-high">
            {TABS.map((tab) => (
              <Link
                key={tab}
                href={tabHref(tab, query)}
                className={`px-5 py-2.5 font-body text-label-md transition-all ${
                  tab === activeTab
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-t-lg"
                }`}
              >
                {tab}
              </Link>
            ))}
          </div>
          <AdminSearchInput
            basePath="/admin/products"
            placeholder="Search by product name"
            defaultValue={query}
            hiddenParams={{ status: activeTab === "All" ? undefined : activeTab.toLowerCase() }}
          />
        </div>
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low/30">
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px]">
                  Product
                </th>
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px]">
                  Category
                </th>
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px]">
                  Price
                </th>
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px]">
                  Stock
                </th>
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px]">
                  Status
                </th>
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 px-6 text-center font-body text-on-surface-variant">
                    No products yet. Click &ldquo;Add Product&rdquo; to create your first one.
                  </td>
                </tr>
              )}
              {products.map((product) => {
                const tone = stockTone(product.stock ?? 0);
                const category =
                  typeof product.category === "object" && product.category
                    ? product.category.name
                    : "—";
                const firstPhoto = Array.isArray(product.photos) ? product.photos[0] : null;
                const photoUrl =
                  firstPhoto && typeof firstPhoto === "object" ? firstPhoto.url : null;
                return (
                  <tr key={product.id} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div
                          aria-hidden
                          className="relative w-14 h-14 rounded-xl bg-secondary-container shrink-0 overflow-hidden"
                        >
                          {photoUrl && (
                            <Image src={photoUrl} alt="" fill sizes="56px" className="object-cover" />
                          )}
                        </div>
                        <span className="flex items-center gap-1.5">
                          <span className="font-headline text-[18px] text-on-surface">{product.name}</span>
                          {product.featured && (
                            <span
                              title="Featured product"
                              aria-label="Featured product"
                              className="material-symbols-outlined text-tertiary text-[18px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-body text-on-surface-variant">{category}</td>
                    <td className="py-4 px-6 font-body text-on-surface">
                      ₱{product.price.toLocaleString("en-PH")}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${tone.dot}`} />
                        <span className={`font-body font-medium ${tone.text}`}>{tone.label}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          product.status === "published"
                            ? "bg-primary-container/10 text-primary"
                            : "bg-secondary-container text-on-secondary-container"
                        }`}
                      >
                        {product.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/new?id=${product.id}`}
                          title="Edit"
                          className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors inline-flex"
                        >
                          <span aria-hidden className="material-symbols-outlined text-[20px]">
                            edit
                          </span>
                        </Link>
                        <form action={deleteProduct}>
                          <input type="hidden" name="id" value={product.id} />
                          <ConfirmSubmitButton
                            confirmMessage={`Delete "${product.name}"? This cannot be undone.`}
                            title="Delete"
                            className="p-2 hover:bg-error-container/20 rounded-full text-error transition-colors"
                          >
                            <span aria-hidden className="material-symbols-outlined text-[20px]">
                              delete
                            </span>
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-6 py-6 border-t border-outline-variant">
            <Pagination
              basePath="/admin/products"
              page={page}
              totalPages={totalPages}
              totalDocs={totalDocs}
              pageSize={PAGE_SIZE}
              extraParams={{
                status: activeTab === "All" ? undefined : activeTab.toLowerCase(),
                q: query,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
