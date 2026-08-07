import NotificationBell from "./NotificationBell";

export default function AdminTopbar({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between h-20 px-6 md:px-8 border-b border-surface-container-high bg-surface-container-lowest">
      <h1 className="font-headline text-headline-sm text-on-surface">{title}</h1>
      <div className="flex items-center gap-3">
        {actions}
        <NotificationBell />
        <div className="flex items-center gap-2 pl-3 border-l border-surface-container-high">
          <span className="material-symbols-outlined text-on-surface-variant">
            account_circle
          </span>
          <span className="hidden sm:inline font-body text-body-md text-on-surface">
            Trisha
          </span>
        </div>
      </div>
    </div>
  );
}
