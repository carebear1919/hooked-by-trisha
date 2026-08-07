"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

type MediaOption = {
  id: number | string;
  url?: string | null;
  thumbnailURL?: string | null;
  title?: string | null;
  filename?: string | null;
};

export default function ProductPhotoPicker({
  mediaOptions,
  initialSelectedIds,
}: {
  mediaOptions: MediaOption[];
  initialSelectedIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initialSelectedIds);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerFileInputRef = useRef<HTMLInputElement>(null);

  const mediaById = useMemo(() => new Map(mediaOptions.map((m) => [String(m.id), m])), [mediaOptions]);

  const filteredOptions = mediaOptions.filter((m) => {
    const label = (m.title || m.filename || "").toLowerCase();
    return label.includes(search.toLowerCase());
  });

  function toggleExisting(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function removeExisting(id: string) {
    setSelected((prev) => prev.filter((i) => i !== id));
  }

  function syncFileInput(files: File[]) {
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }

  function handlePickerFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const next = [...pendingFiles, ...Array.from(fileList)];
    setPendingFiles(next);
    syncFileInput(next);
  }

  function removePending(index: number) {
    const next = pendingFiles.filter((_, i) => i !== index);
    setPendingFiles(next);
    syncFileInput(next);
  }

  return (
    <div>
      <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">Photos</label>

      {/* Hidden inputs that actually submit with the form */}
      {selected.map((id) => (
        <input key={id} type="hidden" name="photos" value={id} />
      ))}
      <input ref={fileInputRef} type="file" name="newPhotos" multiple accept="image/*" className="hidden" />

      <div className="flex flex-wrap gap-3">
        {selected.map((id) => {
          const media = mediaById.get(id);
          return (
            <div key={id} className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/30">
              {media?.url && (
                <Image
                  src={media.thumbnailURL ?? media.url}
                  alt={media.title ?? ""}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => removeExisting(id)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-surface/90 text-error flex items-center justify-center"
              >
                <span aria-hidden className="material-symbols-outlined text-[14px]">
                  close
                </span>
              </button>
            </div>
          );
        })}

        {pendingFiles.map((file, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] px-1 truncate">New</span>
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => removePending(i)}
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-surface/90 text-error flex items-center justify-center"
            >
              <span aria-hidden className="material-symbols-outlined text-[14px]">
                close
              </span>
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors"
        >
          <span aria-hidden className="material-symbols-outlined">
            add
          </span>
          <span className="text-[10px]">Add</span>
        </button>
      </div>

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
              <h2 className="font-headline text-headline-sm text-on-surface">Choose Photos</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-full font-body text-label-md bg-primary text-on-primary hover:opacity-90 transition-colors"
              >
                Done
              </button>
            </div>

            <div className="p-6 border-b border-outline-variant/30 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => pickerFileInputRef.current?.click()}
                className="px-4 py-2 rounded-full font-body text-label-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-2"
              >
                <span aria-hidden className="material-symbols-outlined text-[18px]">
                  upload
                </span>
                Upload New
              </button>
              <input
                ref={pickerFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handlePickerFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search media library…"
                className="flex-1 min-w-[160px] bg-surface-container-low border-none rounded-full px-4 py-2 text-body-md focus:ring-2 focus:ring-primary"
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
                    onClick={() => toggleExisting(id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      isSelected ? "border-primary" : "border-transparent hover:border-outline-variant"
                    }`}
                  >
                    {m.url && (
                      <Image
                        src={m.thumbnailURL ?? m.url}
                        alt={m.title ?? ""}
                        fill
                        sizes="120px"
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
