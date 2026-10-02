"use client";

import { Building2, ExternalLink, MoreHorizontal, Plus, Settings2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, useApiAction, useListQuery } from "@/hooks/use-api";
import { parseSort, useQueryParams } from "@/hooks/use-query-params";
import { formatRelative, humanize, locationLine } from "@/lib/format";
import { propertyCover } from "@/lib/property-media";
import { PROPERTY_STATUSES, PROPERTY_TYPES, type Property, type PropertyStatus } from "@/types/api";

const SORTS = [
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "createdAt:desc", label: "Newest first" },
  { value: "title:asc", label: "Title A–Z" },
  { value: "city:asc", label: "City A–Z" },
];

function RowActions({ property }: { property: Property }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const setStatus = useApiAction((status: PropertyStatus) => api.patch(`/properties/${property.id}`, { status }), {
    success: "Listing status updated",
    invalidate: [["properties"]],
  });
  const remove = useApiAction(() => api.delete(`/properties/${property.id}`), {
    success: "Property deleted",
    invalidate: [["properties"]],
  });

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/provider/properties/${property.id}`}>
          <Settings2 /> Manage
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`More actions for ${property.title}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Set status</DropdownMenuLabel>
          {PROPERTY_STATUSES.filter((s) => s !== property.status).map((s) => (
            <DropdownMenuItem key={s} onSelect={() => setStatus.mutate(s)}>
              <StatusBadge status={s} />
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {property.status === "PUBLISHED" && (
            <DropdownMenuItem asChild>
              <Link href={`/properties/${property.id}`} target="_blank">
                <ExternalLink /> View public page
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {confirmOpen && (
        <ConfirmDialogOpen
          title={`Delete "${property.title}"?`}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => remove.mutateAsync(undefined)}
        />
      )}
    </div>
  );
}

/** ConfirmDialog opened programmatically from a dropdown item. */
function ConfirmDialogOpen({ title, onClose, onConfirm }: { title: string; onClose: () => void; onConfirm: () => Promise<unknown> }) {
  return (
    <ConfirmDialog
      defaultOpen
      onOpenChange={(open) => !open && onClose()}
      trigger={<span className="hidden" />}
      title={title}
      description="The listing is removed from search and your dashboard. Rental history is kept for records."
      confirmLabel="Delete property"
      destructive
      onConfirm={onConfirm}
    />
  );
}

export function MyProperties() {
  const { get, page } = useQueryParams();
  const query = {
    page,
    limit: 10,
    search: get("search"),
    status: get("status"),
    propertyType: get("propertyType"),
    ...parseSort(get("sort"), "updatedAt:desc"),
  };
  const { data, isLoading } = useListQuery<Property>(["properties", "mine"], "/properties/my-properties", query);

  const columns: Column<Property>[] = [
    {
      key: "property",
      header: "Property",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative hidden size-12 shrink-0 overflow-hidden rounded-lg sm:block">
            <Image src={propertyCover(p.id, p.propertyType, 200)} alt="" fill sizes="48px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <Link href={`/provider/properties/${p.id}`} className="line-clamp-1 font-medium hover:text-primary">
              {p.title}
            </Link>
            <p className="line-clamp-1 text-xs text-muted-foreground">{locationLine(p)}</p>
          </div>
        </div>
      ),
    },
    { key: "type", header: "Type", hideOnMobile: true, cell: (p) => <span className="text-sm">{humanize(p.propertyType)}</span> },
    { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
    { key: "updated", header: "Updated", hideOnMobile: true, cell: (p) => <span className="text-sm text-muted-foreground">{formatRelative(p.updatedAt)}</span> },
    { key: "actions", header: <span className="sr-only">Actions</span>, className: "text-right", cell: (p) => <RowActions property={p} /> },
  ];

  return (
    <div className="space-y-4">
      <ListToolbar>
        <SearchInput placeholder="Search your properties" />
        <FilterSelect paramKey="status" options={PROPERTY_STATUSES} placeholder="Status" allLabel="All statuses" />
        <FilterSelect paramKey="propertyType" options={PROPERTY_TYPES} placeholder="Type" allLabel="All types" />
        <FilterSelect paramKey="sort" options={SORTS} placeholder="Sort" defaultValue="updatedAt:desc" />
      </ListToolbar>
      <DataTable
        columns={columns}
        data={data?.data}
        isLoading={isLoading}
        rowKey={(p) => p.id}
        emptyState={
          <EmptyState
            icon={Building2}
            title="No properties found"
            description={query.search || query.status || query.propertyType ? "No listings match these filters." : "Add your first property to start receiving requests."}
            action={
              <Button asChild>
                <Link href="/provider/properties/new">
                  <Plus /> Add property
                </Link>
              </Button>
            }
          />
        }
      />
      {data && <PaginationControls meta={data.meta} itemLabel="properties" />}
    </div>
  );
}
