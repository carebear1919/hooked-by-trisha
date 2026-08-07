import { Suspense } from "react";
import Image from "next/image";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import FlashToast from "@/components/admin/FlashToast";
import { getPayloadClient } from "@/lib/payload";
import { createCategory, deleteCategory } from "../actions";

export default async function AdminCategoriesPage() {
  const payload = await getPayloadClient();
  const { docs: categories } = await payload.find({
    collection: "categories",
    sort: "name",
    depth: 1,
    limit: 100,
  });

  return (
    <>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <AdminTopbar title="Categories" />
      <div className="p-6 md:p-8 space-y-6">
        <form
          action={createCategory}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 flex flex-wrap gap-4 items-end"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
              Name
            </label>
            <input
              name="name"
              required
              placeholder="e.g. Bags"
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex-[2] min-w-[240px]">
            <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
              Description
            </label>
            <input
              name="description"
              placeholder="Short description shown on the category page"
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
              Image
            </label>
            <input
              type="file"
              name="categoryImage"
              accept="image/*"
              className="w-full bg-surface-container-low border border-dashed border-outline-variant rounded-md px-3 py-2 text-body-md file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-on-primary file:px-3 file:py-1.5 file:font-body file:text-label-md file:cursor-pointer cursor-pointer"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-on-primary flex items-center gap-2 px-6 py-2.5 rounded-full font-body text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <span aria-hidden className="material-symbols-outlined text-[20px]">
              add
            </span>
            Add Category
          </button>
        </form>

        <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low/30">
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px]">
                  Image
                </th>
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px]">
                  Name
                </th>
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px]">
                  Slug
                </th>
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px]">
                  Description
                </th>
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 px-6 text-center font-body text-on-surface-variant">
                    No categories yet. Add your first one above.
                  </td>
                </tr>
              )}
              {categories.map((cat) => {
                const image = typeof cat.image === "object" && cat.image ? cat.image : null;
                return (
                <tr key={cat.id} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="relative w-12 h-12 rounded-lg bg-secondary-container overflow-hidden shrink-0">
                      {image?.url && (
                        <Image src={image.url} alt={image.alt ?? cat.name} fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-headline text-[16px] text-on-surface">{cat.name}</td>
                  <td className="py-4 px-6 font-body text-on-surface-variant">{cat.slug}</td>
                  <td className="py-4 px-6 font-body text-on-surface-variant max-w-md truncate">
                    {cat.description}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Delete "${cat.name}"? Products in this category will keep the reference but the category will be gone.`}
                        title="Delete"
                        className="p-2 hover:bg-error-container/20 rounded-full text-error transition-colors"
                      >
                        <span aria-hidden className="material-symbols-outlined text-[20px]">
                          delete
                        </span>
                      </ConfirmSubmitButton>
                    </form>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
