"use client";

export default function SiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-[1280px] mx-auto px-container-padding py-24 flex flex-col items-center text-center">
      <span aria-hidden className="material-symbols-outlined text-6xl text-error/60 mb-6">
        error_outline
      </span>
      <h1 className="font-headline text-headline-lg text-on-surface mb-2">Something went wrong</h1>
      <p className="font-body text-body-md text-on-surface-variant max-w-md mb-8">
        We hit a snag loading this page. Please try again — if it keeps happening, let us know.
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="px-8 py-3 bg-primary text-on-primary font-body text-label-md rounded-full hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
        <a
          href="/"
          className="px-8 py-3 border border-outline-variant text-on-surface-variant font-body text-label-md rounded-full hover:bg-surface-container transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
