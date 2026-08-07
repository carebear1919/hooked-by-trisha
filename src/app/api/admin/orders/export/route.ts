import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { getPayloadClient } from "@/lib/payload";
import type { Where } from "payload";

function csvEscape(value: unknown): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();

  const whereClauses: Where[] = [];
  if (status) whereClauses.push({ orderStatus: { equals: status } });
  if (q) {
    const orConditions: Where[] = [{ buyerName: { like: q } }, { email: { like: q } }];
    if (!Number.isNaN(Number(q))) orConditions.push({ id: { equals: Number(q) } });
    whereClauses.push({ or: orConditions });
  }

  const payload = await getPayloadClient();
  const { docs: orders } = await payload.find({
    collection: "orders",
    sort: "-createdAt",
    limit: 5000,
    where: whereClauses.length > 0 ? { and: whereClauses } : undefined,
  });

  const header = [
    "Order ID",
    "Date",
    "Buyer Name",
    "Email",
    "Contact Number",
    "Items",
    "Subtotal",
    "Shipping Fee",
    "Total",
    "Payment Method",
    "Payment Status",
    "Order Status",
  ];

  const rows = orders.map((o) => [
    o.id,
    new Date(o.createdAt).toISOString(),
    o.buyerName,
    o.email,
    o.contactNumber ?? "",
    o.items?.length ?? 0,
    o.subtotal,
    o.shippingFee,
    o.total,
    o.paymentMethod ?? "",
    o.paymentStatus ?? "",
    o.orderStatus ?? "",
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
