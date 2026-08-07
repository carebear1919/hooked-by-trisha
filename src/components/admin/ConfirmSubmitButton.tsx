"use client";

import { useRef, useState } from "react";

export default function ConfirmSubmitButton({
  confirmMessage,
  confirmTitle = "Are you sure?",
  confirmLabel = "Delete",
  children,
  className,
  title,
}: {
  confirmMessage: string;
  confirmTitle?: string;
  confirmLabel?: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleConfirm = () => {
    setOpen(false);
    buttonRef.current?.closest("form")?.requestSubmit();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        title={title}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-dialog-title" className="font-headline text-headline-sm text-on-surface mb-2">
              {confirmTitle}
            </h2>
            <p className="font-body text-body-md text-on-surface-variant mb-6">{confirmMessage}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2.5 rounded-full font-body text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-full font-body text-label-md bg-error text-on-error hover:opacity-90 transition-colors"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
