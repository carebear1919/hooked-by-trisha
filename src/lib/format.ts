export type StockStatus = "in-stock" | "low-stock" | "sold-out";

export function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString("en-PH")}`;
}

export function stockLabel(stock: StockStatus): string {
  if (stock === "in-stock") return "In Stock";
  if (stock === "low-stock") return "Low Stock";
  return "Sold Out";
}
