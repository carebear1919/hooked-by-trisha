"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function NotificationHighlight() {
  const params = useSearchParams();
  const highlight = params.get("highlight");

  useEffect(() => {
    if (!highlight) return;
    const el = document.querySelector(`[data-highlight-target="${highlight}"]`);

    // Strip the param from the URL bar without triggering a Next.js
    // navigation/re-render, which would wipe the glow class we're about to add.
    const url = new URL(window.location.href);
    url.searchParams.delete("highlight");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);

    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("notif-glow");
    const timer = setTimeout(() => el.classList.remove("notif-glow"), 2400);
    return () => clearTimeout(timer);
  }, [highlight]);

  return null;
}
