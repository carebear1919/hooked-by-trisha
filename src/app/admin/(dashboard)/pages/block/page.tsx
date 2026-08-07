import Link from "next/link";
import { notFound } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import MediaPicker from "@/components/admin/MediaPicker";
import { getPayloadClient, lexicalToText } from "@/lib/payload";
import { addBlock, getOrCreateHomePage, updateBlockAction } from "../actions";
import { BLOCK_TYPES, type BlockType, type PageBlock } from "../block-types";

const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero",
  imageText: "Image + Text",
  gallery: "Gallery",
  testimonial: "Testimonial",
  faq: "FAQ",
  richText: "Rich Text",
};

function fieldWrap(label: string, children: React.ReactNode) {
  return (
    <div>
      <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">{label}</label>
      {children}
    </div>
  );
}

export default async function BlockFormPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; index?: string }>;
}) {
  const { type: typeParam, index: indexParam } = await searchParams;
  const type = typeParam as BlockType;
  if (!BLOCK_TYPES.includes(type)) notFound();

  const index = indexParam !== undefined ? Number(indexParam) : undefined;
  const isEdit = index !== undefined;

  const payload = await getPayloadClient();
  const [{ docs: mediaOptions }, { layout }] = await Promise.all([
    payload.find({ collection: "media", sort: "-createdAt", limit: 100 }),
    getOrCreateHomePage(),
  ]);

  const existing: PageBlock | undefined = isEdit ? layout[index] : undefined;
  const action = isEdit ? updateBlockAction : addBlock;

  function imageId(value: unknown): string {
    if (typeof value === "object" && value && "id" in value) return String((value as { id: unknown }).id);
    return value ? String(value) : "";
  }

  return (
    <>
      <AdminTopbar
        title={`Pages / Home / ${isEdit ? "Edit" : "Add"} ${BLOCK_LABELS[type]}`}
        actions={
          <>
            <Link
              href="/admin/pages"
              className="px-6 py-2.5 rounded-full font-body text-label-md border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="block-form"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-body text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Save
            </button>
          </>
        }
      />
      <form id="block-form" action={action} className="p-6 md:p-8 w-full space-y-6">
        <input type="hidden" name="blockType" value={type} />
        {isEdit && <input type="hidden" name="index" value={index} />}

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 md:p-8 space-y-6 max-w-4xl">
          {type === "hero" && (
            <>
              {fieldWrap(
                "Eyebrow",
                <input
                  name="eyebrow"
                  defaultValue={String(existing?.eyebrow ?? "")}
                  placeholder="Handmade With Love"
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                />
              )}
              {fieldWrap(
                "Headline",
                <input
                  name="headline"
                  required
                  defaultValue={String(existing?.headline ?? "")}
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                />
              )}
              {fieldWrap(
                "Subtext",
                <textarea
                  name="subtext"
                  rows={3}
                  defaultValue={String(existing?.subtext ?? "")}
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                />
              )}
              <MediaPicker
                label="Image"
                fieldName="image"
                mediaOptions={mediaOptions}
                initialSelectedIds={imageId(existing?.image) ? [imageId(existing?.image)] : []}
              />
              <div className="grid grid-cols-2 gap-4">
                {fieldWrap(
                  "Button Label",
                  <input
                    name="buttonLabel"
                    defaultValue={String(existing?.buttonLabel ?? "")}
                    placeholder="Shop the Collection"
                    className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                  />
                )}
                {fieldWrap(
                  "Button Link",
                  <input
                    name="buttonHref"
                    defaultValue={String(existing?.buttonHref ?? "")}
                    placeholder="/shop"
                    className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>
            </>
          )}

          {type === "imageText" && (
            <>
              <MediaPicker
                label="Image"
                fieldName="image"
                required
                mediaOptions={mediaOptions}
                initialSelectedIds={imageId(existing?.image) ? [imageId(existing?.image)] : []}
              />
              {fieldWrap(
                "Heading",
                <input
                  name="heading"
                  defaultValue={String(existing?.heading ?? "")}
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                />
              )}
              {fieldWrap(
                "Text",
                <textarea
                  name="text"
                  rows={4}
                  defaultValue={existing ? lexicalToText(existing.text) : ""}
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                />
              )}
              {fieldWrap(
                "Image Position",
                <select
                  name="imagePosition"
                  defaultValue={String(existing?.imagePosition ?? "left")}
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              )}
            </>
          )}

          {type === "gallery" && (
            <MediaPicker
              label="Images"
              fieldName="images"
              multiple
              mediaOptions={mediaOptions}
              initialSelectedIds={
                Array.isArray(existing?.images)
                  ? (existing.images as { image: unknown }[]).map((i) => imageId(i.image))
                  : []
              }
            />
          )}

          {type === "testimonial" && (
            <>
              {fieldWrap(
                "Quote",
                <textarea
                  name="quote"
                  required
                  rows={4}
                  defaultValue={String(existing?.quote ?? "")}
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                />
              )}
              {fieldWrap(
                "Attribution",
                <input
                  name="attribution"
                  defaultValue={String(existing?.attribution ?? "")}
                  placeholder="— Happy Customer"
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                />
              )}
            </>
          )}

          {type === "faq" && (
            <div className="space-y-4">
              <p className="font-body text-label-md uppercase text-on-surface-variant">
                Up to 5 questions — leave blank to skip
              </p>
              {Array.from({ length: 5 }).map((_, i) => {
                const q = Array.isArray(existing?.questions) ? existing.questions[i] : undefined;
                return (
                  <div key={i} className="space-y-2 border-t border-outline-variant/30 pt-4 first:border-t-0 first:pt-0">
                    <input
                      name={`question-${i}`}
                      defaultValue={String((q as { question?: string })?.question ?? "")}
                      placeholder={`Question ${i + 1}`}
                      className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                    />
                    <textarea
                      name={`answer-${i}`}
                      rows={2}
                      defaultValue={String((q as { answer?: string })?.answer ?? "")}
                      placeholder="Answer"
                      className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {type === "richText" &&
            fieldWrap(
              "Content",
              <textarea
                name="content"
                rows={8}
                defaultValue={existing ? lexicalToText(existing.content) : ""}
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
              />
            )}
        </div>
      </form>
    </>
  );
}
