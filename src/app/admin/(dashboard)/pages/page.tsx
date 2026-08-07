import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import AdminTopbar from "@/components/admin/AdminTopbar";
import FlashToast from "@/components/admin/FlashToast";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import PreviewModal from "@/components/admin/PreviewModal";
import {
  deleteBlock,
  duplicateBlock,
  getOrCreateHomePage,
  getPublishedHomeMeta,
  moveBlock,
  publishHomePage,
} from "./actions";
import type { PageBlock } from "./block-types";

const BLOCK_LABELS: Record<string, string> = {
  hero: "Hero Section",
  imageText: "Image + Text",
  gallery: "Gallery",
  testimonial: "Testimonial",
  faq: "FAQ",
  richText: "Rich Text",
};

const BLOCK_ICONS: Record<string, string> = {
  hero: "panorama",
  imageText: "view_agenda",
  gallery: "grid_view",
  testimonial: "format_quote",
  faq: "quiz",
  richText: "notes",
};

const ADD_OPTIONS: { type: string; label: string; icon: string; description: string }[] = [
  { type: "hero", label: "Hero", icon: "panorama", description: "Big banner with headline, photo, and a button." },
  {
    type: "imageText",
    label: "Image + Text",
    icon: "view_agenda",
    description: "A photo alongside a heading and paragraph.",
  },
  { type: "gallery", label: "Gallery", icon: "grid_view", description: "A grid of photos, no captions." },
  {
    type: "testimonial",
    label: "Testimonial",
    icon: "format_quote",
    description: "A customer quote with attribution.",
  },
  { type: "faq", label: "FAQ", icon: "quiz", description: "Up to 5 expandable question/answer pairs." },
  { type: "richText", label: "Rich Text", icon: "notes", description: "A plain paragraph of text." },
];

function blockPreview(block: PageBlock): string {
  switch (block.blockType) {
    case "hero":
      return String(block.headline ?? "(no headline)");
    case "imageText":
      return String(block.heading ?? "(no heading)");
    case "gallery":
      return `${Array.isArray(block.images) ? block.images.length : 0} image(s)`;
    case "testimonial":
      return String(block.quote ?? "(no quote)");
    case "faq":
      return `${Array.isArray(block.questions) ? block.questions.length : 0} question(s)`;
    case "richText":
      return "Rich text content";
    default:
      return "";
  }
}

function blockThumbnailUrl(block: PageBlock): string | null {
  function mediaUrl(value: unknown): string | null {
    return value && typeof value === "object" && "url" in value
      ? ((value as { url?: string | null }).url ?? null)
      : null;
  }

  switch (block.blockType) {
    case "hero":
    case "imageText":
      return mediaUrl(block.image);
    case "gallery": {
      const first = Array.isArray(block.images) ? block.images[0] : null;
      return first ? mediaUrl((first as { image?: unknown }).image) : null;
    }
    default:
      return null;
  }
}

export default async function PagesEditorPage() {
  const [{ layout, hasUnpublishedChanges }, { updatedAt }] = await Promise.all([
    getOrCreateHomePage(),
    getPublishedHomeMeta(),
  ]);

  return (
    <>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <AdminTopbar
        title="Pages / Home"
        actions={
          <>
            <PreviewModal previewUrl="/?preview=1" />
            <form action={publishHomePage}>
              <button
                type="submit"
                disabled={!hasUnpublishedChanges}
                className="px-6 py-2 bg-primary text-on-primary rounded-full font-body text-label-md hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Publish
              </button>
            </form>
          </>
        }
      />
      <div className="p-6 md:p-8 bg-surface-container-low flex-1">
        <div className="w-full space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-body text-label-md font-bold ${
                hasUnpublishedChanges
                  ? "bg-tertiary-container/30 text-tertiary"
                  : "bg-primary-container/20 text-primary"
              }`}
            >
              <span aria-hidden className="material-symbols-outlined text-[18px]">
                {hasUnpublishedChanges ? "edit_note" : "check_circle"}
              </span>
              {hasUnpublishedChanges ? "Unpublished changes" : "All changes live"}
            </span>
            {updatedAt && (
              <span className="font-body text-label-md text-on-surface-variant">
                Last published {new Date(updatedAt).toLocaleString("en-PH")}
              </span>
            )}
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 flex items-start gap-3 font-body text-body-md text-on-surface-variant">
            <span aria-hidden className="material-symbols-outlined text-primary shrink-0">
              help
            </span>
            <p>
              These blocks appear on the homepage, below the Hero, Shop by Category, and New Arrivals
              sections (those are fixed and can&apos;t be reordered here). Add, edit, or reorder blocks
              below, then <strong>Preview</strong> before you <strong>Publish</strong> — customers only
              see what&apos;s published.
            </p>
          </div>

          {hasUnpublishedChanges && (
            <div className="bg-tertiary-container/20 border border-tertiary/30 text-on-surface rounded-xl px-4 py-3 flex items-center gap-3 font-body text-body-md">
              <span aria-hidden className="material-symbols-outlined text-tertiary">
                info
              </span>
              You have unpublished changes. Customers still see the last published version —
              preview to check your edits, then hit Publish to make them live.
            </div>
          )}

          {layout.length === 0 && (
            <p className="text-center font-body text-body-md text-on-surface-variant py-8">
              No extra content blocks yet. Add one below to get started.
            </p>
          )}

          {layout.map((block, index) => {
            const thumbnailUrl = blockThumbnailUrl(block);
            return (
              <div
                key={index}
                className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-4 flex items-center gap-4 shadow-sm"
              >
                <div className="flex flex-col">
                  <form action={moveBlock}>
                    <input type="hidden" name="index" value={index} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      aria-label="Move up"
                      className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <span aria-hidden className="material-symbols-outlined text-sm">
                        arrow_upward
                      </span>
                    </button>
                  </form>
                  <form action={moveBlock}>
                    <input type="hidden" name="index" value={index} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === layout.length - 1}
                      aria-label="Move down"
                      className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <span aria-hidden className="material-symbols-outlined text-sm">
                        arrow_downward
                      </span>
                    </button>
                  </form>
                </div>
                <div className="relative w-24 h-16 rounded-lg bg-secondary-fixed shrink-0 overflow-hidden flex items-center justify-center">
                  {thumbnailUrl ? (
                    <Image src={thumbnailUrl} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <span aria-hidden className="material-symbols-outlined text-on-secondary-fixed-variant">
                      {BLOCK_ICONS[block.blockType] ?? "widgets"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-label-md font-bold text-on-surface">
                    {BLOCK_LABELS[block.blockType] ?? block.blockType}
                  </p>
                  <p className="text-xs text-on-surface-variant opacity-70 truncate">{blockPreview(block)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/pages/block?type=${block.blockType}&index=${index}`}
                    title="Edit"
                    className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                  >
                    <span aria-hidden className="material-symbols-outlined text-sm">
                      edit
                    </span>
                  </Link>
                  <form action={duplicateBlock}>
                    <input type="hidden" name="index" value={index} />
                    <button
                      type="submit"
                      title="Duplicate"
                      className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                    >
                      <span aria-hidden className="material-symbols-outlined text-sm">
                        content_copy
                      </span>
                    </button>
                  </form>
                  <form action={deleteBlock}>
                    <input type="hidden" name="index" value={index} />
                    <ConfirmSubmitButton
                      confirmMessage={`Delete this ${BLOCK_LABELS[block.blockType] ?? block.blockType} block?`}
                      title="Delete"
                      className="p-2 hover:bg-error-container/20 text-error rounded-full transition-colors"
                    >
                      <span aria-hidden className="material-symbols-outlined text-sm">
                        delete
                      </span>
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <p className="font-body text-label-md uppercase text-on-surface-variant mb-3 text-center">
              Add Block
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {ADD_OPTIONS.map((opt) => (
                <Link
                  key={opt.type}
                  href={`/admin/pages/block?type=${opt.type}`}
                  className="flex flex-col items-center text-center gap-2 py-4 px-3 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all"
                >
                  <span aria-hidden className="material-symbols-outlined">
                    {opt.icon}
                  </span>
                  <span className="font-body text-label-md font-bold">{opt.label}</span>
                  <span className="text-xs opacity-70">{opt.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
