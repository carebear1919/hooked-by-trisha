import Link from "next/link";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { getPayloadClient } from "@/lib/payload";

const STATUS_STYLES: Record<string, string> = {
  shipped: "bg-primary-fixed text-on-primary-fixed-variant",
  processing: "bg-secondary-container text-on-secondary-container",
  paid: "bg-primary-fixed text-on-primary-fixed-variant",
  new: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  completed: "bg-primary-fixed text-on-primary-fixed-variant",
  cancelled: "bg-surface-container-high text-on-surface-variant",
};

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboardPage() {
  const payload = await getPayloadClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [ordersToday, pendingOrders, weekOrders, lowStockProducts, recentOrders, pendingPayments, recentMessages] =
    await Promise.all([
      payload.count({ collection: "orders", where: { createdAt: { greater_than_equal: startOfToday.toISOString() } } }),
      payload.count({ collection: "orders", where: { orderStatus: { in: ["new", "processing"] } } }),
      payload.find({
        collection: "orders",
        where: {
          and: [
            { createdAt: { greater_than_equal: sevenDaysAgo.toISOString() } },
            { paymentStatus: { equals: "paid" } },
          ],
        },
        limit: 1000,
      }),
      payload.find({
        collection: "products",
        where: { stock: { less_than_equal: LOW_STOCK_THRESHOLD } },
        limit: 5,
      }),
      payload.find({ collection: "orders", sort: "-createdAt", limit: 4 }),
      payload.find({
        collection: "orders",
        where: { paymentStatus: { equals: "pending" } },
        limit: 3,
      }),
      payload.find({ collection: "contact-messages", sort: "-createdAt", limit: 2 }),
    ]);

  const revenueThisWeek = weekOrders.docs.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "Orders Today", value: String(ordersToday.totalDocs), icon: "shopping_basket", tone: "primary" },
    { label: "Pending Orders", value: String(pendingOrders.totalDocs), icon: "pending_actions", tone: "tertiary" },
    { label: "Revenue This Week", value: `₱${revenueThisWeek.toLocaleString("en-PH")}`, icon: "payments", tone: "primary" },
    { label: "Low Stock Items", value: String(lowStockProducts.totalDocs), icon: "warning", tone: "error" },
  ] as const;

  const attentionItems = [
    ...lowStockProducts.docs.map((p) => ({
      icon: "inventory",
      tone: "bg-error-container/30 text-error",
      title: p.name,
      detail: p.stock <= 0 ? "Out of stock." : `Only ${p.stock} left in stock.`,
      action: "Manage Stock",
      href: `/admin/products/new?id=${p.id}`,
    })),
    ...pendingPayments.docs.map((o) => ({
      icon: "account_balance_wallet",
      tone: "bg-secondary-container text-on-secondary-container",
      title: `${(o.paymentMethod ?? "Payment").toUpperCase()} — #${o.id}`,
      detail: "Awaiting manual verification of payment.",
      action: "Review Order",
      href: `/admin/orders/${o.id}`,
    })),
    ...recentMessages.docs.map((m) => ({
      icon: "mail",
      tone: "bg-primary-fixed/40 text-primary",
      title: `New message from ${m.name}`,
      detail: m.message.length > 80 ? `${m.message.slice(0, 80)}…` : m.message,
      action: "Reply via Email",
      href: `mailto:${m.email}`,
    })),
  ];

  return (
    <>
      <AdminTopbar
        title="Dashboard"
        actions={
          <Link
            href="/admin/analytics"
            className="bg-primary text-on-primary flex items-center gap-2 px-6 py-2.5 rounded-full font-body text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <span aria-hidden className="material-symbols-outlined text-[20px]">
              monitoring
            </span>
            View Analytics
          </Link>
        }
      />
      <div className="p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-2 rounded-lg ${
                    stat.tone === "error"
                      ? "bg-error-container/30"
                      : stat.tone === "tertiary"
                        ? "bg-tertiary-container/20"
                        : "bg-primary-container/10"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`material-symbols-outlined ${
                      stat.tone === "error" ? "text-error" : "text-primary"
                    }`}
                  >
                    {stat.icon}
                  </span>
                </div>
              </div>
              <p className="text-on-surface-variant font-body text-label-md mb-1 uppercase tracking-tighter">
                {stat.label}
              </p>
              <h3 className="font-headline text-headline-sm text-on-surface">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-outline-variant/10">
              <h4 className="font-headline text-headline-sm text-primary">Recent Orders</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 font-body text-label-md text-outline uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-4 font-body text-label-md text-outline uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-4 font-body text-label-md text-outline uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 font-body text-label-md text-outline uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 font-body text-label-md text-outline uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {recentOrders.docs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center font-body text-on-surface-variant">
                        No orders yet.
                      </td>
                    </tr>
                  )}
                  {recentOrders.docs.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-4 font-body text-on-surface">#{order.id}</td>
                      <td className="px-6 py-4 font-body text-on-surface">{order.buyerName}</td>
                      <td className="px-6 py-4 font-body text-on-surface">
                        ₱{order.total.toLocaleString("en-PH")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[12px] font-bold capitalize ${STATUS_STYLES[order.orderStatus ?? "new"] ?? "bg-surface-container text-on-surface-variant"}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-body text-on-surface-variant">
                        {new Date(order.createdAt).toLocaleDateString("en-PH")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 mt-auto bg-surface-container-low/30 border-t border-outline-variant/10 text-center">
              <Link
                href="/admin/orders"
                className="text-primary font-body text-label-md hover:underline inline-flex items-center justify-center gap-2"
              >
                View All Orders
                <span aria-hidden className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col">
            <div className="p-6 border-b border-outline-variant/10">
              <h4 className="font-headline text-headline-sm text-tertiary">Needs Attention</h4>
            </div>
            <div className="flex-1 p-6 space-y-6">
              {attentionItems.length === 0 && (
                <p className="font-body text-body-md text-on-surface-variant">
                  Nothing needs your attention right now.
                </p>
              )}
              {attentionItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className={`p-2 rounded-lg ${item.tone}`}>
                    <span aria-hidden className="material-symbols-outlined">
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-on-surface font-bold">{item.title}</p>
                    <p className="text-label-md text-outline">{item.detail}</p>
                    <Link
                      href={item.href}
                      className="inline-block mt-2 text-primary font-body text-label-md hover:underline"
                    >
                      {item.action}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
