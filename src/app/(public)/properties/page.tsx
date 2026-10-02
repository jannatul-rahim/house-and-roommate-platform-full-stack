import { Building2, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyFilters } from "@/components/property/property-filters";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { serverApi } from "@/lib/api/server";
import { dateInputToIso } from "@/lib/format";
import { PROPERTY_TYPES, type PropertyType, type PublicProperty } from "@/types/api";

export const metadata: Metadata = {
  title: "Find a room",
  description: "Search published rooms and homes for rent across Bangladesh. Filter by city, property type, budget and move-in date.",
  openGraph: {
    title: "Find a room | NestMate",
    description: "Search published rooms and homes for rent across Bangladesh.",
  },
};

const SORT_FIELDS = new Set(["createdAt", "title", "city"]);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const money = (v: string | undefined) => (v && /^\d+(\.\d{1,2})?$/.test(v) ? v : undefined);

/** Whitelists URL params before they reach the API's strict query schema. */
function toApiQuery(sp: Record<string, string | string[] | undefined>) {
  const [sortBy, sortOrder] = (one(sp.sort) ?? "createdAt:desc").split(":");
  const type = one(sp.propertyType);
  const from = one(sp.availableFrom);
  return {
    page: Math.max(1, Number(one(sp.page)) || 1),
    limit: 9,
    search: one(sp.search)?.trim().slice(0, 100) || undefined,
    city: one(sp.city)?.trim().slice(0, 120) || undefined,
    propertyType: PROPERTY_TYPES.includes(type as PropertyType) ? type : undefined,
    minPrice: money(one(sp.minPrice)),
    maxPrice: money(one(sp.maxPrice)),
    availableFrom: from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? dateInputToIso(from) : undefined,
    sortBy: SORT_FIELDS.has(sortBy) ? sortBy : "createdAt",
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
  };
}

export default async function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  const query = toApiQuery(await searchParams);

  let result: Awaited<ReturnType<typeof serverApi.list<PublicProperty>>> | null = null;
  let error: string | null = null;
  try {
    result = await serverApi.list<PublicProperty>("/properties", { query, revalidate: 30 });
  } catch (err) {
    error = err instanceof ApiError ? err.message : "Listings are temporarily unavailable.";
  }

  return (
    <div className="container-page space-y-8 py-10">
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">Browse listings</p>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Find your next room</h1>
        <p className="text-muted-foreground">
          {result ? `${result.meta.total} published propert${result.meta.total === 1 ? "y" : "ies"} match your search.` : "Search homes with rooms available to rent."}
        </p>
      </div>

      <PropertyFilters />

      {error ? (
        <EmptyState icon={SearchX} title="We couldn't load listings" description={error} />
      ) : result && result.data.length ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((property, i) => (
              <PropertyCard key={property.id} property={property} priority={i < 3} />
            ))}
          </div>
          <PaginationControls meta={result.meta} itemLabel="properties" />
        </>
      ) : (
        <EmptyState
          icon={Building2}
          title="No properties found"
          description="Try a different keyword, widen your budget or clear some filters."
          action={
            <Button variant="outline" asChild>
              <Link href="/properties">Clear all filters</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
