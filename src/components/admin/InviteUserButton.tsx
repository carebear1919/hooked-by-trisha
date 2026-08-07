"use client";

import { useState } from "react";

export default function InviteUserButton({
  createAction,
}: {
  createAction: (formData: FormData) => void;
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
          person_add
        </span>
        Invite User
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
            <h2 className="font-headline text-headline-sm text-on-surface mb-4">Invite CMS User</h2>
            <p className="font-body text-body-md text-on-surface-variant mb-4">
              Creates a login for the Payload CMS admin (<code>/cms-admin</code>) — separate from the
              storefront admin panel you&apos;re using now.
            </p>
            <form action={createAction} className="space-y-4">
              <div>
                <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                  Name
                </label>
                <input
                  name="name"
                  placeholder="e.g. Trisha"
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                  Role
                </label>
                <select
                  name="role"
                  defaultValue="editor"
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block font-body text-label-md uppercase text-on-surface-variant mb-2">
                  Temporary Password
                </label>
                <input
                  type="text"
                  name="password"
                  required
                  minLength={8}
                  placeholder="Share this with them securely"
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
