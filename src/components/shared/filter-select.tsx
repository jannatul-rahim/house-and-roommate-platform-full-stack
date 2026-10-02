"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryParams } from "@/hooks/use-query-params";
import { humanize } from "@/lib/format";
import { cn } from "@/lib/utils";

const ALL = "__all__";

export interface FilterOption {
  value: string;
  label?: string;
}

interface FilterSelectProps {
  paramKey: string;
  options: readonly (FilterOption | string)[];
  placeholder: string;
  /** Label of the "no filter" option. Omit to make a choice mandatory (e.g. sort). */
  allLabel?: string;
  defaultValue?: string;
  className?: string;
}

/** A select bound to one URL search param (`?status=PAID`). */
export function FilterSelect({ paramKey, options, placeholder, allLabel, defaultValue, className }: FilterSelectProps) {
  const { get, setParams } = useQueryParams();
  const value = get(paramKey) ?? defaultValue ?? (allLabel ? ALL : undefined);
  const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: humanize(o) } : o));

  return (
    <Select
      value={value}
      onValueChange={(next) => setParams({ [paramKey]: next === ALL || next === defaultValue ? null : next })}
    >
      <SelectTrigger className={cn("h-9 w-full sm:w-44", className)} aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allLabel && <SelectItem value={ALL}>{allLabel}</SelectItem>}
        {normalized.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label ?? humanize(option.value)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
