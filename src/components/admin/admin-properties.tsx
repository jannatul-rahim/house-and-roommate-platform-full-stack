"use client";

import { Archive, Building2, EyeOff, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { api, useApiAction, useListQuery } from "@/hooks/use-api";
import { parseSort, useQueryParams } from "@/hooks/use-query-params";
import { formatCurrency, formatDate, humanize, locationLine } from "@/lib/format";
import { propertyCover } from "@/lib/property-media";
import { PROPERTY_TYPES, type PublicProperty } from "@/types/api";

const SORTS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "title:asc", label: "Title A–Z" },
  { value: "city:asc", label: "City A–Z" },
];

/** Moderation of every published listing: unpublish, archive or remove. */
export function AdminProperties() {
  const { get, page } = useQueryParams();
  const query = { page, limit: 10, search: get("search"), propertyType: get("propertyType"), city: get("city"), ...parseSort(get("sort"), "createdAt:desc") };
  const { data, isLoading } = useListQuery<PublicProperty>(["properties", "admin"], "/properties", query);

  const moderate = useApiAction(({ id, status }: { id: string; status: "UNPUBLISHED" | "ARCHIVED" }) => api.patch(`/properties/${id}`, { status }), {
    success: "Listing moderated — it no longer appears in search",
    invalidate: [["properties"]],
  });
  const remove = useApiAction((id: string) => api.delete(`/properties/${id}`), { success: "Listing deleted", invalidate: [["properties"]] });

  const columns: Column<PublicProperty>[] = [
    {
      key: "property",
      header: "Listing",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative hidden size-12 shrink-0 overflow-hidden rounded-lg sm:block">
            <Image src={propertyCover(p.id, p.propertyType, 200)} alt="" fill sizes="48px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <Link href={`/properties/${p.id}`} target="_blank" className="line-clamp-1 font-medium hover:text-primary">
              {p.title}
            </Link>
            <p className="line-clamp-1 text-xs text-muted-foreground">{locationLine(p)}</p>
          </div>
        </div>
      ),
    },
    { key: "type", header: "Type", hideOnMobile: true, cell: (p) => <span className="text-sm">{humanize(p.propertyType)}</span> },
    { key: "rooms", header: "Free rooms", cell: (p) => <span className="font-medium">{p.availableRoomCount}</span> },
    { key: "rent", header: "From", hideOnMobile: true, cell: (p) => <span className="text-sm">{formatCurrency(p.minMonthlyRent)}</span> },
    { key: "listed", header: "Listed", hideOnMobile: true, cell: (p) => <span className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</span> },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => moderate.mutate({ id: p.id, status: "UNPUBLISHED" })} disabled={moderate.isPending}>
            <EyeOff /> Unpublish
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => moderate.mutate({ id: p.id, status: "ARCHIVED" })} disabled={moderate.isPending} aria-label={`Archive ${p.title}`}>
            <Archive />
          </Button>
          <ConfirmDialog
            trigger={
              <Button size="icon-sm" variant="ghost" className="text-destructive" aria-label={`Delete ${p.title}`}>
                <Trash2 />
              </Button>
            }
            title={`Delete "${p.title}"?`}
            description="The listing is soft-deleted and removed from the platform. Rental history is preserved."
            confirmLabel="Delete listing"
            destructive
            onConfirm={() => remove.mutateAsync(p.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ListToolbar>
        <SearchInput placeholder="Search listings" />
        <SearchInput placeholder="City" paramKey="city" className="sm:max-w-40" />
        <FilterSelect paramKey="propertyType" options={PROPERTY_TYPES} placeholder="Type" allLabel="All types" />
        <FilterSelect paramKey="sort" options={SORTS} placeholder="Sort" defaultValue="createdAt:desc" />
      </ListToolbar>
      <DataTable
        columns={columns}
        data={data?.data}
        isLoading={isLoading}
        rowKey={(p) => p.id}
        emptyState={<EmptyState icon={Building2} title="No published listings" description="Nothing matches these filters." />}
      />
      {data && <PaginationControls meta={data.meta} itemLabel="listings" />}
    </div>
  );
}
