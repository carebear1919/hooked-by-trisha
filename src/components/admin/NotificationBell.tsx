"use client";

import { useEffect, useRef, useState } from "react";
import {
  type BellNotification,
  getRecentNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
} from "@/app/admin/(dashboard)/notifications-bell-actions";

const EVENT_ICONS: Record<string, string> = {
  "new-order": "shopping_cart",
  "payment-confirmed": "verified",
  "payment-failed": "error_outline",
  "contact-form": "forum",
  "low-stock": "inventory_2",
};

const EVENT_FALLBACK_LINK: Record<string, string> = {
  "new-order": "/admin/orders",
  "payment-confirmed": "/admin/orders",
  "payment-failed": "/admin/orders",
  "contact-form": "/admin/messages",
  "low-stock": "/admin/products",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<BellNotification[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUnreadNotificationCount().then(setUnreadCount).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      const list = await getRecentNotifications();
      setItems(list);
      if (unreadCount > 0) {
        setUnreadCount(0);
        markAllNotificationsRead().catch(() => {});
      }
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={handleToggle}
        className="relative text-on-surface-variant hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 z-[200]">
          <div className="p-4 border-b border-outline-variant/10">
            <h3 className="font-headline text-headline-sm text-on-surface">Notifications</h3>
          </div>
          {items === null ? (
            <p className="p-6 text-center font-body text-body-md text-on-surface-variant">Loading…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-center font-body text-body-md text-on-surface-variant">
              No notifications yet.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/10">
              {items.map((item) => {
                const content = (
                  <div className="flex gap-3 p-4 hover:bg-surface-container-low/40 transition-colors">
                    <span aria-hidden className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      {EVENT_ICONS[item.eventType] ?? "notifications"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-body-md text-on-surface truncate">{item.message}</p>
                      <p className="font-body text-label-md text-on-surface-variant">
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  </div>
                );
                const href = item.link ?? EVENT_FALLBACK_LINK[item.eventType] ?? "/admin";
                return (
                  <li key={item.id}>
                    <a href={href} onClick={() => setOpen(false)}>
                      {content}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
