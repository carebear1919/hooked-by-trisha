import Link from "next/link";

export default function Pagination({
  basePath,
  page,
  totalPages,
  totalDocs,
  pageSize,
  extraParams,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  totalDocs: number;
  pageSize: number;
  extraParams?: Record<string, string | undefined>;
}) {
  if (totalDocs === 0) {
    return <span className="font-body text-on-surface-variant text-sm">No results</span>;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalDocs);

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(extraParams ?? {})) {
      if (value) params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <span className="font-body text-on-surface-variant text-sm">
        Showing {start}-{end} of {totalDocs}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Link
            href={hrefFor(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`px-4 py-2 rounded-full font-body text-label-md border border-outline-variant transition-colors ${
              page <= 1
                ? "pointer-events-none opacity-40"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            Previous
          </Link>
          <span className="font-body text-label-md text-on-surface-variant px-2">
            Page {page} of {totalPages}
          </span>
          <Link
            href={hrefFor(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={`px-4 py-2 rounded-full font-body text-label-md border border-outline-variant transition-colors ${
              page >= totalPages
                ? "pointer-events-none opacity-40"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
