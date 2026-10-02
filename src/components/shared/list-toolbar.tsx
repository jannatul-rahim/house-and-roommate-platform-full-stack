"use client";

import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/hooks/use-query-params";

/** Row of filters for a list page with a "clear filters" action. */
export function ListToolbar({ children }: { children: React.ReactNode }) {
  const { all, clear } = useQueryParams();
  const hasFilters = Object.keys(all).length > 0;

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
