"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: "monitoring" },
  { href: "/admin/products", label: "Products", icon: "shopping_bag" },
  { href: "/admin/categories", label: "Categories", icon: "category" },
  { href: "/admin/orders", label: "Orders", icon: "receipt_long" },
  { href: "/admin/messages", label: "Messages", icon: "forum" },
  { href: "/admin/pages", label: "Pages", icon: "article" },
  { href: "/admin/media", label: "Media Library", icon: "photo_library" },
  { href: "/admin/settings", label: "Site Settings", icon: "settings" },
  { href: "/admin/notifications", label: "Notifications", icon: "notifications" },
  { href: "/admin/users", label: "Users", icon: "group" },
];

const STORAGE_KEY = "hbt_admin_sidebar_collapsed";

export default function AdminSidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    setHydrated(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className={`hidden md:flex shrink-0 flex-col border-r border-surface-container-high bg-surface-container-lowest transition-[width] duration-200 ${
        collapsed ? "md:w-[72px]" : "md:w-64"
      } ${hydrated ? "" : "invisible"}`}
    >
      <div className="flex items-center gap-2 h-20 px-6 border-b border-surface-container-high overflow-hidden">
        <span aria-hidden className="material-symbols-outlined text-primary text-2xl shrink-0">
          spa
        </span>
        {!collapsed && (
          <span className="font-headline text-headline-sm font-bold text-on-surface whitespace-nowrap">
            Hooked by Trisha
          </span>
        )}
      </div>
      <nav aria-label="Admin" className="flex-1 py-4 px-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-body-md transition-colors overflow-hidden ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-primary-container/15 text-primary font-medium"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span aria-hidden className="material-symbols-outlined text-xl shrink-0">
                {item.icon}
              </span>
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-surface-container-high p-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-body-md text-on-surface-variant hover:bg-surface-container transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span aria-hidden className="material-symbols-outlined text-xl shrink-0">
            {collapsed ? "chevron_right" : "chevron_left"}
          </span>
          {!collapsed && <span className="whitespace-nowrap">Collapse</span>}
        </button>
        {email && !collapsed && (
          <p className="px-3 font-body text-label-md text-on-surface-variant truncate" title={email}>
            {email}
          </p>
        )}
        <form action="/api/admin/auth/logout" method="POST">
          <button
            type="submit"
            title={collapsed ? "Log Out" : undefined}
            className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-body-md text-on-surface-variant hover:bg-surface-container transition-colors overflow-hidden ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span aria-hidden className="material-symbols-outlined text-xl shrink-0">
              logout
            </span>
            {!collapsed && <span className="whitespace-nowrap">Log Out</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
