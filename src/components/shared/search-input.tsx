"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryParams } from "@/hooks/use-query-params";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  paramKey?: string;
  className?: string;
}

/** Debounced search box whose value lives in the URL (`?search=...`). */
export function SearchInput({ placeholder = "Search...", paramKey = "search", className }: SearchInputProps) {
  const { get, setParams } = useQueryParams();
  const urlValue = get(paramKey) ?? "";
  const [value, setValue] = useState(urlValue);
  const debounced = useDebounce(value.trim(), 400);

  // Keep the box in sync when the URL changes elsewhere (back button, "clear filters").
  useEffect(() => setValue(urlValue), [urlValue]);

  useEffect(() => {
    if (debounced !== urlValue) setParams({ [paramKey]: debounced || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={cn("relative w-full sm:max-w-xs", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 pr-8 pl-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
