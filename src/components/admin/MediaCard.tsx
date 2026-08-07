"use client";

import Image from "next/image";
import { useState } from "react";

type MediaItem = {
  id: number | string;
  url?: string | null;
  thumbnailURL?: string | null;
  alt?: string | null;
  title?: string | null;
  filename?: string | null;
  description?: string | null;
};

export default function MediaCard({
  item,
  deleteAction,
}: {
  item: MediaItem;
  deleteAction: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const displayName = item.title || item.filename || "Untitled";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 flex flex-col text-left"
      >
        <div className="relative aspect-square bg-surface-container-low">
          {item.url && (
            <Image
              src={item.thumbnailURL ?? item.url}
              alt={item.alt ?? displayName}
              fill
              sizes="200px"
              className="object-cover group-hover:opacity-80 transition-opacity"
            />
          )}
        </div>
        <div className="p-2 border-t border-outline-variant/20">
          <p className="font-body text-label-md text-on-surface truncate" title={displayName}>
            {displayName}
          </p>
          {item.description && (
            <p className="text-xs text-on-surface-variant truncate" title={item.description}>
              {item.description}
            </p>
          )}
        </div>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            setOpen(false);
            setConfirmingDelete(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-surface-container-low">
              {item.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={item.alt ?? displayName} className="w-full h-full object-contain" />
              )}
            </div>
            <div className="p-6 space-y-4">
              {!confirmingDelete ? (
                <>
                  <div>
                    <h2 className="font-headline text-headline-sm text-on-surface">{displayName}</h2>
                    {item.filename && item.title && item.title !== item.filename && (
                      <p className="text-xs text-on-surface-variant mt-1">{item.filename}</p>
                    )}
                  </div>
                  {item.description && (
                    <p className="font-body text-body-md text-on-surface-variant">{item.description}</p>
                  )}
                  <p className="text-xs text-on-surface-variant">
                    <span className="uppercase tracking-wider">Alt text:</span> {item.alt || "—"}
                  </p>
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(true)}
                      className="px-5 py-2.5 rounded-full font-body text-label-md bg-error-container/20 text-error hover:bg-error-container/30 transition-colors flex items-center gap-2"
                    >
                      <span aria-hidden className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="px-5 py-2.5 rounded-full font-body text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-headline text-headline-sm text-on-surface">Delete this image?</h2>
                  <p className="font-body text-body-md text-on-surface-variant">
                    &ldquo;{displayName}&rdquo; will be permanently removed. Products or pages using it will lose
                    the image.
                  </p>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className="px-5 py-2.5 rounded-full font-body text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      Cancel
                    </button>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-full font-body text-label-md bg-error text-on-error hover:opacity-90 transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
