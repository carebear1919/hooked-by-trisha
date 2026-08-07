import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "buyerName",
    defaultColumns: ["buyerName", "total", "paymentStatus", "orderStatus", "createdAt"],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "buyerName", type: "text", required: true },
    { name: "contactNumber", type: "text" },
    { name: "email", type: "email", required: true },
    { name: "address", type: "textarea" },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "product", type: "relationship", relationTo: "products" },
        { name: "quantity", type: "number", required: true, min: 1 },
        { name: "priceSnapshot", type: "number", required: true, min: 0 },
      ],
    },
    { name: "subtotal", type: "number", required: true, min: 0 },
    { name: "shippingFee", type: "number", required: true, min: 0, defaultValue: 0 },
    { name: "total", type: "number", required: true, min: 0 },
    {
      name: "paymentMethod",
      type: "select",
      options: [
        { label: "GCash", value: "gcash" },
        { label: "BPI", value: "bpi" },
        { label: "Card", value: "card" },
      ],
    },
    {
      name: "paymentStatus",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Paid", value: "paid" },
        { label: "Failed", value: "failed" },
      ],
    },
    { name: "paymentReference", type: "text" },
    {
      name: "orderStatus",
      type: "select",
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Processing", value: "processing" },
        { label: "Shipped", value: "shipped" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
  ],
};
