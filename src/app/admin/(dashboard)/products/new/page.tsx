import { Suspense } from "react";
import Link from "next/link";
import AdminTopbar from "@/components/admin/AdminTopbar";
import NotificationHighlight from "@/components/admin/NotificationHighlight";
import ProductPhotoPicker from "@/components/admin/ProductPhotoPicker";
import { getPayloadClient, lexicalToText } from "@/lib/payload";
import { createProduct, updateProduct } from "../../actions";

export default async function ProductFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const payload = await getPayloadClient();

  const [{ docs: categories }, { docs: mediaOptions }, product] = await Promise.all([
    payload.find({ collection: "categories", sort: "name", limit: 100 }),
    payload.find({ collection: "media", sort: "-createdAt", limit: 100 }),
    id ? payload.findByID({ collection: "products", id }) : Promise.resolve(null),
  ]);

  const isEdit = Boolean(product);
  const action = isEdit ? updateProduct : createProduct;

  return (
    <>
      <Suspense fallback={null}>
        <NotificationHighlight />
      </Suspense>
      <AdminTopbar
        title={isEdit ? `Products / Edit` : "Products / Add New"}
        actions={
          <>
            <Link
              href="/admin/products"
              className="px-6 py-2.5 rounded-full font-body text-label-md border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="product-form"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-body text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Save
            </button>
          </>
        }
      />
      <form
        id="product-form"
        action={action}
        className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
        data-highlight-target={isEdit ? `product-${product!.id}` : undefined}
      >
        {isEdit && <input type="hidden" name="id" value={product!.id} />}

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 space-y-6">
            <div>
              <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                Product Name
              </label>
              <input
                name="name"
                required
                defaultValue={product?.name ?? ""}
                placeholder="e.g. Sunflower Tote Bag"
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={6}
                defaultValue={product ? lexicalToText(product.description) : ""}
                placeholder="Describe the piece — materials, size, what makes it special."
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                Materials &amp; Care
              </label>
              <textarea
                name="materialsCare"
                rows={3}
                defaultValue={product?.materialsCare ?? ""}
                placeholder="e.g. 100% organic cotton yarn. Hand wash cold, lay flat to dry."
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                Shipping &amp; Returns
              </label>
              <textarea
                name="shippingReturns"
                rows={3}
                defaultValue={product?.shippingReturns ?? ""}
                placeholder="e.g. Processed within 3-5 business days. Returns accepted within 7 days."
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
              />
            </div>
            <ProductPhotoPicker
              mediaOptions={mediaOptions}
              initialSelectedIds={
                Array.isArray(product?.photos)
                  ? product.photos.map((p) => (typeof p === "object" && p ? String(p.id) : String(p)))
                  : []
              }
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 space-y-6">
            <div>
              <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                Status
              </label>
              <select
                name="status"
                defaultValue={product?.status ?? "draft"}
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                Price (₱)
              </label>
              <input
                name="price"
                type="number"
                min={0}
                required
                defaultValue={product?.price ?? ""}
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                Compare-at Price (₱)
              </label>
              <input
                name="compareAtPrice"
                type="number"
                min={0}
                defaultValue={product?.compareAtPrice ?? ""}
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                Stock Quantity
              </label>
              <input
                name="stock"
                type="number"
                min={0}
                required
                defaultValue={product?.stock ?? 0}
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                Category
              </label>
              <select
                name="category"
                required
                defaultValue={
                  typeof product?.category === "object" ? product.category?.id : product?.category ?? ""
                }
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product?.featured ?? false}
                className="h-5 w-5 accent-primary"
              />
              <span className="font-body text-body-md text-on-surface">Featured Product</span>
            </label>
          </div>
        </div>
      </form>
    </>
  );
}
