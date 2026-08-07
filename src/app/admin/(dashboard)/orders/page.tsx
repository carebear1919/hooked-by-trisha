import Link from "next/link";
import type { Where } from "payload";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import AdminTopbar from "@/components/admin/AdminTopbar";
import Pagination from "@/components/admin/Pagination";
import { getPayloadClient } from "@/lib/payload";

const TABS = ["All", "New", "Processing", "Shipped", "Completed", "Cancelled"];
const PAGE_SIZE = 20;

const PAYMENT_STYLES: Record<string, string> = {
  paid: "bg-primary-container/20 text-primary",
  pending: "bg-tertiary-container/20 text-tertiary",
  failed: "bg-error-container text-on-error-container",
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  processing: "bg-secondary-container text-on-secondary-container",
  shipped: "bg-outline-variant text-on-surface",
  completed: "bg-primary-fixed text-primary",
  cancelled: "bg-surface-container-high text-on-surface-variant",
};

function tabHref(tab: string, q?: string) {
  const params = new URLSearchParams();
  if (tab !== "All") params.set("status", tab.toLowerCase());
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/admin/orders?${qs}` : "/admin/orders";
}

export default async function OrdersListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}) {
  const { page: pageParam, status, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const activeTab = TABS.find((t) => t.toLowerCase() === status?.toLowerCase()) ?? "All";
  const query = q?.trim();

  const whereClauses: Where[] = [];
  if (activeTab !== "All") whereClauses.push({ orderStatus: { equals: activeTab.toLowerCase() } });
  if (query) {
    const orConditions: Where[] = [{ buyerName: { like: query } }, { email: { like: query } }];
    if (!Number.isNaN(Number(query))) orConditions.push({ id: { equals: Number(query) } });
    whereClauses.push({ or: orConditions });
  }

  const payload = await getPayloadClient();
  const { docs: orders, totalDocs, totalPages } = await payload.find({
    collection: "orders",
    sort: "-createdAt",
    limit: PAGE_SIZE,
    page,
    where: whereClauses.length > 0 ? { and: whereClauses } : undefined,
  });

  const exportParams = new URLSearchParams();
  if (activeTab !== "All") exportParams.set("status", activeTab.toLowerCase());
  if (query) exportParams.set("q", query);
  const exportHref = `/api/admin/orders/export${exportParams.toString() ? `?${exportParams}` : ""}`;

  return (
    <>
      <AdminTopbar
        title="Orders"
        actions={
          <a
            href={exportHref}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full font-body text-label-md border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span aria-hidden className="material-symbols-outlined text-[20px]">
              download
            </span>
            Export CSV
          </a>
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
            basePath="/admin/orders"
            placeholder="Search by buyer, email, or order #"
            defaultValue={query}
            hiddenParams={{ status: activeTab === "All" ? undefined : activeTab.toLowerCase() }}
          />
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="px-6 py-4 font-body text-on-surface-variant uppercase tracking-wider text-[11px]">
                    Order #
                  </th>
                  <th className="px-6 py-4 font-body text-on-surface-variant uppercase tracking-wider text-[11px]">
                    Buyer Name
                  </th>
                  <th className="px-6 py-4 font-body text-on-surface-variant uppercase tracking-wider text-[11px]">
                    Date
                  </th>
                  <th className="px-6 py-4 font-body text-on-surface-variant uppercase tracking-wider text-[11px]">
                    Items
                  </th>
                  <th className="px-6 py-4 font-body text-on-surface-variant uppercase tracking-wider text-[11px]">
                    Total
                  </th>
                  <th className="px-6 py-4 font-body text-on-surface-variant uppercase tracking-wider text-[11px]">
                    Payment
                  </th>
                  <th className="px-6 py-4 font-body text-on-surface-variant uppercase tracking-wider text-[11px]">
                    Status
                  </th>
                  <th className="px-6 py-4 font-body text-on-surface-variant uppercase tracking-wider text-[11px] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center font-body text-on-surface-variant">
                      No orders yet.
                    </td>
                  </tr>
                )}
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-bold text-primary font-body">#{order.id}</td>
                    <td className="px-6 py-4 text-on-surface">{order.buyerName}</td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString("en-PH")}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{order.items?.length ?? 0} items</td>
                    <td className="px-6 py-4 font-medium text-on-surface">
                      ₱{order.total.toLocaleString("en-PH")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${PAYMENT_STYLES[order.paymentStatus ?? "pending"]}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${STATUS_STYLES[order.orderStatus ?? "new"]}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary font-bold text-label-md hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-5 bg-surface-container-low border-t border-outline-variant/20">
            <Pagination
              basePath="/admin/orders"
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
