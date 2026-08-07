"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type MediaOption = {
  id: number | string;
  url?: string | null;
  thumbnailURL?: string | null;
  title?: string | null;
  filename?: string | null;
};

export default function MediaPicker({
  mediaOptions,
  fieldName,
  initialSelectedIds,
  multiple = false,
  label,
  required = false,
}: {
  mediaOptions: MediaOption[];
  fieldName: string;
  initialSelectedIds: string[];
  multiple?: boolean;
  label?: string;
  required?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(initialSelectedIds);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const mediaById = useMemo(() => new Map(mediaOptions.map((m) => [String(m.id), m])), [mediaOptions]);

  const filteredOptions = mediaOptions.filter((m) => {
    const label = (m.title || m.filename || "").toLowerCase();
    return label.includes(search.toLowerCase());
  });

  function pick(id: string) {
    if (multiple) {
      setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    } else {
      setSelected([id]);
      setOpen(false);
    }
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((i) => i !== id));
  }

  return (
    <div>
      {label && (
        <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
          {label}
        </label>
      )}

      {selected.map((id) => (
        <input key={id} type="hidden" name={fieldName} value={id} />
      ))}

      <div className="flex flex-wrap gap-3">
        {selected.map((id) => {
          const media = mediaById.get(id);
          return (
            <div
              key={id}
              className="relative w-28 h-28 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/30"
            >
              {media?.url && (
                <Image
                  src={media.thumbnailURL ?? media.url}
                  alt={media.title ?? ""}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              )}
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => remove(id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-surface/90 text-error flex items-center justify-center"
              >
                <span aria-hidden className="material-symbols-outlined text-[16px]">
                  close
                </span>
              </button>
            </div>
          );
        })}

        {(multiple || selected.length === 0) && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-28 h-28 rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors"
          >
            <span aria-hidden className="material-symbols-outlined text-[28px]">
              add_photo_alternate
            </span>
            <span className="text-xs">{multiple ? "Add" : "Choose"}</span>
          </button>
        )}
      </div>
      {required && selected.length === 0 && (
        <p className="mt-2 text-xs text-error">An image is required.</p>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between gap-4">
              <h2 className="font-headline text-headline-sm text-on-surface">Choose from Media Library</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-full font-body text-label-md bg-primary text-on-primary hover:opacity-90 transition-colors"
              >
                Done
              </button>
            </div>

            <div className="p-6 border-b border-outline-variant/30">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search media library…"
                className="w-full bg-surface-container-low border-none rounded-full px-4 py-2 text-body-md focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filteredOptions.length === 0 && (
                <p className="col-span-full text-center font-body text-body-md text-on-surface-variant py-8">
                  No media found.
                </p>
              )}
              {filteredOptions.map((m) => {
                const id = String(m.id);
                const isSelected = selected.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => pick(id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      isSelected ? "border-primary" : "border-transparent hover:border-outline-variant"
                    }`}
                  >
                    {m.url && (
                      <Image
                        src={m.thumbnailURL ?? m.url}
                        alt={m.title ?? ""}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                    )}
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center">
                        <span aria-hidden className="material-symbols-outlined text-[16px]">
                          check
                        </span>
                      </span>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate text-left">
                      {m.title || m.filename}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
