import AdminTopbar from "@/components/admin/AdminTopbar";
import BreakdownBars from "@/components/admin/BreakdownBars";
import RevenueChart from "@/components/admin/RevenueChart";
import { getPayloadClient } from "@/lib/payload";

// Order-status colors follow the order's actual lifecycle/severity — muted
// neutral for a fresh order, deepening green as it progresses, true red
// reserved only for cancelled (the one status that's actually a problem).
const STATUS_COLORS: Record<string, string> = {
  new: "bg-secondary",
  processing: "bg-primary/50",
  shipped: "bg-primary/75",
  completed: "bg-primary",
  cancelled: "bg-error",
};

const PAYMENT_COLORS: Record<string, string> = {
  gcash: "bg-primary",
  bpi: "bg-secondary",
  card: "bg-tertiary",
};

const TREND_DAYS = 30;

export default async function AnalyticsPage() {
  const payload = await getPayloadClient();

  const [allOrders, paidOrders] = await Promise.all([
    payload.find({ collection: "orders", limit: 2000, sort: "-createdAt" }),
    payload.find({
      collection: "orders",
      where: { paymentStatus: { equals: "paid" } },
      limit: 2000,
      depth: 2,
    }),
  ]);

  const totalRevenue = paidOrders.docs.reduce((sum, o) => sum + o.total, 0);
  const totalPaidOrders = paidOrders.totalDocs;
  const avgOrderValue = totalPaidOrders > 0 ? totalRevenue / totalPaidOrders : 0;
  const uniqueCustomers = new Set(allOrders.docs.map((o) => o.email.toLowerCase())).size;

  const dayBuckets = Array.from({ length: TREND_DAYS }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (TREND_DAYS - 1 - i));
    return d;
  });
  const revenueByDay = dayBuckets.map((d) => {
    const dayStart = d.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const ordersOnDay = paidOrders.docs.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= dayStart && t < dayEnd;
    });
    return {
      label: d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
      date: d.toISOString(),
      revenue: ordersOnDay.reduce((sum, o) => sum + o.total, 0),
      orders: ordersOnDay.length,
    };
  });

  const statusCounts = new Map<string, number>();
  for (const o of allOrders.docs) {
    const s = o.orderStatus ?? "new";
    statusCounts.set(s, (statusCounts.get(s) ?? 0) + 1);
  }
  const statusRows = Array.from(statusCounts.entries()).map(([label, value]) => ({
    label,
    value,
    display: String(value),
    colorClass: STATUS_COLORS[label] ?? "bg-outline-variant",
  }));

  const paymentCounts = new Map<string, number>();
  for (const o of paidOrders.docs) {
    const m = o.paymentMethod ?? "unknown";
    paymentCounts.set(m, (paymentCounts.get(m) ?? 0) + 1);
  }
  const paymentRows = Array.from(paymentCounts.entries()).map(([label, value]) => ({
    label,
    value,
    display: String(value),
    colorClass: PAYMENT_COLORS[label] ?? "bg-outline-variant",
  }));

  const productAgg = new Map<string, { name: string; revenue: number; qty: number }>();
  const categoryAgg = new Map<string, number>();
  for (const o of paidOrders.docs) {
    for (const item of o.items ?? []) {
      const product = item.product;
      if (!product || typeof product !== "object") continue;
      const key = String(product.id);
      const lineRevenue = item.priceSnapshot * item.quantity;
      const entry = productAgg.get(key) ?? { name: product.name, revenue: 0, qty: 0 };
      entry.revenue += lineRevenue;
      entry.qty += item.quantity;
      productAgg.set(key, entry);

      const category = product.category;
      const categoryName =
        category && typeof category === "object" ? category.name : "Uncategorized";
      categoryAgg.set(categoryName, (categoryAgg.get(categoryName) ?? 0) + lineRevenue);
    }
  }
  const topProducts = Array.from(productAgg.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const categoryRows = Array.from(categoryAgg.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      display: `₱${value.toLocaleString("en-PH")}`,
      colorClass: "bg-primary",
    }));

  const summaryStats = [
    { label: "Total Revenue (Paid)", value: `₱${totalRevenue.toLocaleString("en-PH")}`, icon: "payments" },
    { label: "Paid Orders", value: String(totalPaidOrders), icon: "receipt_long" },
    { label: "Avg. Order Value", value: `₱${Math.round(avgOrderValue).toLocaleString("en-PH")}`, icon: "trending_up" },
    { label: "Unique Customers", value: String(uniqueCustomers), icon: "group" },
  ];

  return (
    <>
      <AdminTopbar title="Analytics" />
      <div className="p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {summaryStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10"
            >
              <div className="p-2 rounded-lg bg-primary-container/10 w-fit mb-4">
                <span aria-hidden className="material-symbols-outlined text-primary">
                  {stat.icon}
                </span>
              </div>
              <p className="text-on-surface-variant font-body text-label-md mb-1 uppercase tracking-tighter">
                {stat.label}
              </p>
              <h3 className="font-headline text-headline-sm text-on-surface">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-6">
          <h4 className="font-headline text-headline-sm text-primary mb-4">Revenue — Last {TREND_DAYS} Days</h4>
          <RevenueChart data={revenueByDay} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-6">
            <h4 className="font-headline text-headline-sm text-primary mb-4">Orders by Status</h4>
            <BreakdownBars rows={statusRows} />
          </div>
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-6">
            <h4 className="font-headline text-headline-sm text-primary mb-4">Payment Methods</h4>
            <BreakdownBars rows={paymentRows} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10">
              <h4 className="font-headline text-headline-sm text-primary">Top Products</h4>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-3 font-body text-label-md text-outline uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 font-body text-label-md text-outline uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-6 py-3 font-body text-label-md text-outline uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center font-body text-on-surface-variant">
                      No sales yet.
                    </td>
                  </tr>
                )}
                {topProducts.map((p) => (
                  <tr key={p.name}>
                    <td className="px-6 py-3 font-body text-on-surface">{p.name}</td>
                    <td className="px-6 py-3 font-body text-on-surface-variant">{p.qty}</td>
                    <td className="px-6 py-3 font-body text-on-surface">
                      ₱{p.revenue.toLocaleString("en-PH")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-6">
            <h4 className="font-headline text-headline-sm text-primary mb-4">Revenue by Category</h4>
            <BreakdownBars rows={categoryRows} />
          </div>
        </div>
      </div>
    </>
  );
}
