"use client";

import { useState } from "react";

export default function PreviewModal({ previewUrl }: { previewUrl: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-6 py-2 border border-primary text-primary rounded-full font-body text-label-md hover:bg-primary/5 transition-all"
      >
        Preview
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Customer-side preview"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full h-full max-w-[1400px] flex flex-col bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between gap-4 shrink-0">
              <h2 className="font-headline text-headline-sm text-on-surface">
                Customer-Side Preview
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-full font-body text-label-md bg-primary text-on-primary hover:opacity-90 transition-colors"
              >
                Close
              </button>
            </div>
            <iframe
              src={previewUrl}
              title="Customer-side preview"
              className="flex-1 w-full border-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
