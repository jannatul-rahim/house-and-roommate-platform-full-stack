import Form from "next/form";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { humanize } from "@/lib/format";
import { PROPERTY_TYPES } from "@/types/api";

/** Progressive-enhancement search: a plain GET form to /properties (works without JS). */
export function HeroSearch() {
  return (
    <Form
      action="/properties"
      className="grid gap-2 rounded-2xl border bg-card p-2 shadow-xl shadow-primary/5 sm:grid-cols-2 xl:flex xl:items-center"
    >
      <label className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2 focus-within:bg-muted/60 sm:col-span-2 xl:col-span-1">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">Search keyword</span>
        <input
          name="search"
          placeholder="Area, building or keyword"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>
      <label className="flex items-center gap-2 rounded-xl px-3 py-2 focus-within:bg-muted/60 xl:w-36 xl:border-l">
        <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">City</span>
        <input name="city" placeholder="City" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </label>
      <label className="rounded-xl px-3 py-2 xl:w-36 xl:border-l">
        <span className="sr-only">Property type</span>
        <select name="propertyType" defaultValue="" className="w-full bg-transparent text-sm text-foreground outline-none">
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {humanize(type)}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" size="lg" className="h-11 rounded-xl px-6 sm:col-span-2 xl:col-span-1">
        <Search /> Search
      </Button>
    </Form>
  );
}
