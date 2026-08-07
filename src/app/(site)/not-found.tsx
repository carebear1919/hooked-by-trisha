import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-[1280px] mx-auto px-container-padding py-24 flex flex-col items-center text-center">
      <span aria-hidden className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-6">
        search_off
      </span>
      <h1 className="font-headline text-headline-lg text-on-surface mb-2">Page not found</h1>
      <p className="font-body text-body-md text-on-surface-variant max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist, or the piece may have sold out and moved on.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-primary text-on-primary font-body text-label-md rounded-full hover:bg-primary/90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
