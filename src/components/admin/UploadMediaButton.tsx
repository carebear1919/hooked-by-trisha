"use client";

import { useState } from "react";

export default function UploadMediaButton({
  uploadAction,
}: {
  uploadAction: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-primary text-on-primary flex items-center gap-2 px-6 py-2.5 rounded-full font-body text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm"
      >
        <span aria-hidden className="material-symbols-outlined text-[20px]">
          upload
        </span>
        Upload
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-headline text-headline-sm text-on-surface mb-4">Upload Image</h2>
            <form action={uploadAction} className="space-y-4">
              <div>
                <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                  Image File
                </label>
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  required
                  className="w-full bg-surface-container-low border border-dashed border-outline-variant rounded-md px-3 py-4 text-body-md file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-on-primary file:px-3 file:py-1.5 file:font-body file:text-label-md file:cursor-pointer cursor-pointer"
                />
              </div>
              <div>
                <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                  Title
                </label>
                <input
                  name="title"
                  placeholder="e.g. Sunflower Tote — Front"
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                  Alt Text
                </label>
                <input
                  name="alt"
                  placeholder="Describes the image for accessibility"
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-5 py-2.5 rounded-full font-body text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full font-body text-label-md bg-primary text-on-primary hover:opacity-90 transition-colors"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
