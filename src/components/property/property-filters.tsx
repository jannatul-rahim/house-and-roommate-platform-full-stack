"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQueryParams } from "@/hooks/use-query-params";
import { PROPERTY_TYPES } from "@/types/api";

export const PROPERTY_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "title:asc", label: "Title A–Z" },
  { value: "city:asc", label: "City A–Z" },
];

/** Budget / city / move-in filters kept in a popover so mobile stays tidy. */
function MoreFilters() {
  const { get, setParams } = useQueryParams();
  const fromUrl = () => ({
    city: get("city") ?? "",
    minPrice: get("minPrice") ?? "",
    maxPrice: get("maxPrice") ?? "",
    availableFrom: get("availableFrom") ?? "",
  });
  const [draft, setDraft] = useState(fromUrl);
  const [error, setError] = useState<string | null>(null);

  const activeCount = ["city", "minPrice", "maxPrice", "availableFrom"].filter((k) => get(k)).length;

  const apply = () => {
    if (draft.minPrice && draft.maxPrice && Number(draft.minPrice) > Number(draft.maxPrice)) {
      setError("Minimum rent must be less than or equal to maximum rent");
      return;
    }
    setError(null);
    setParams({
      city: draft.city.trim() || null,
      minPrice: draft.minPrice || null,
      maxPrice: draft.maxPrice || null,
      availableFrom: draft.availableFrom || null,
    });
  };

  return (
    // Re-seed the draft from the URL each time the popover opens.
    <Popover onOpenChange={(open) => open && setDraft(fromUrl())}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 justify-start">
          <SlidersHorizontal /> More filters
          {activeCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{activeCount}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="filter-city">City</Label>
          <Input id="filter-city" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="e.g. Dhaka" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="filter-min">Min rent (৳)</Label>
            <Input id="filter-min" type="number" min={0} inputMode="numeric" value={draft.minPrice} onChange={(e) => setDraft({ ...draft, minPrice: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-max">Max rent (৳)</Label>
            <Input id="filter-max" type="number" min={0} inputMode="numeric" value={draft.maxPrice} onChange={(e) => setDraft({ ...draft, maxPrice: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-from">Move in from</Label>
          <Input id="filter-from" type="date" value={draft.availableFrom} onChange={(e) => setDraft({ ...draft, availableFrom: e.target.value })} />
        </div>
        {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
        <Button className="w-full" onClick={apply}>
          Apply filters
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function PropertyFilters() {
  return (
    <ListToolbar>
      <SearchInput placeholder="Search title, area or address" className="sm:max-w-sm" />
      <FilterSelect paramKey="propertyType" options={PROPERTY_TYPES} placeholder="Property type" allLabel="All types" />
      <FilterSelect paramKey="sort" options={PROPERTY_SORT_OPTIONS} placeholder="Sort by" defaultValue="createdAt:desc" />
      <MoreFilters />
    </ListToolbar>
  );
}
