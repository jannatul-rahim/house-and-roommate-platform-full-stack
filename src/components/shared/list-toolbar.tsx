"use client";

import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/hooks/use-query-params";

/** Row of filters for a list page with a "clear filters" action. */
export function ListToolbar({ children }: { children: React.ReactNode }) {
  const { all, setParams } = useQueryParams();
  // `tab` and `page` are navigation, not filters.
  const filterKeys = Object.keys(all).filter((key) => key !== "tab" && key !== "page");
  const hasFilters = filterKeys.length > 0;
  const clear = () => setParams(Object.fromEntries(filterKeys.map((key) => [key, null])));

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {children}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear} className="self-start sm:self-auto">
          <FilterX /> Clear filters
        </Button>
      )}
    </div>
  );
}
