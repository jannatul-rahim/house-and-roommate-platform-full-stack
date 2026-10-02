"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

type ParamUpdates = Record<string, string | number | null | undefined>;

/**
 * URL-synchronised state for filters, sorting, search and pagination, so
 * every list view can be bookmarked or shared (e.g. `?status=PAID&page=2`).
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback((key: string) => searchParams.get(key) ?? undefined, [searchParams]);

  const setParams = useCallback(
    (updates: ParamUpdates, options: { resetPage?: boolean } = { resetPage: true }) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") params.delete(key);
        else params.set(key, String(value));
      }
      // Changing a filter invalidates the current page number.
      if (options.resetPage && !("page" in updates)) params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const clear = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const all = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  return { get, setParams, clear, page, all, searchParams };
}

/** Reads `sort=field:direction` into the API's `sortBy` / `sortOrder` pair. */
export function parseSort(value: string | undefined, fallback: string) {
  const [sortBy, sortOrder] = (value ?? fallback).split(":");
  return { sortBy, sortOrder: sortOrder === "asc" ? "asc" : "desc" } as const;
}
