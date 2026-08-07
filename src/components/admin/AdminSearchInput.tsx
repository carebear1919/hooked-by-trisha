export default function AdminSearchInput({
  basePath,
  placeholder,
  defaultValue,
  hiddenParams,
}: {
  basePath: string;
  placeholder: string;
  defaultValue?: string;
  hiddenParams?: Record<string, string | undefined>;
}) {
  return (
    <form method="GET" action={basePath} className="relative w-full max-w-xs">
      {Object.entries(hiddenParams ?? {}).map(
        ([key, value]) => value && <input key={key} type="hidden" name={key} value={value} />
      )}
      <span
        aria-hidden
        className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none"
      >
        search
      </span>
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary"
      />
    </form>
  );
}
