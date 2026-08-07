"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/lib/toast-context";

export default function FlashToast() {
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shownKey = useRef<string | null>(null);

  useEffect(() => {
    const flash = searchParams.get("flash");
    const error = searchParams.get("error");
    const key = flash ?? error;

    if (!key || shownKey.current === key) return;
    shownKey.current = key;

    if (flash) toast(flash, "success");
    else if (error) toast(error, "error");

    router.replace(pathname);
  }, [searchParams, pathname, router, toast]);

  return null;
}
