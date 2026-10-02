"use client";

import { Ban, FileSignature } from "lucide-react";
import { PersonCell, PropertyRoomCell } from "@/components/dashboard/cells";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { api, useApiAction, useListQuery } from "@/hooks/use-api";
import { parseSort, useQueryParams } from "@/hooks/use-query-params";
import { formatCurrency, formatDate } from "@/lib/format";
import { LEASE_STATUSES, type Lease } from "@/types/api";

const SORTS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "startDate:desc", label: "Start date" },
  { value: "endDate:asc", label: "Ending soonest" },
];

export function ManagedLeases() {
  const { get, page } = useQueryParams();
  const query = { page, limit: 10, status: get("status"), ...parseSort(get("sort"), "createdAt:desc") };
  const { data, isLoading } = useListQuery<Lease>(["leases", "managed"], "/leases/managed", query);
  const terminate = useApiAction((id: string) => api.post(`/leases/${id}/terminate`), { success: "Lease terminated", invalidate: [["leases"]] });

  const columns: Column<Lease>[] = [
    { key: "tenant", header: "Tenant", cell: (l) => <PersonCell user={l.tenant} /> },
    { key: "room", header: "Room", hideOnMobile: true, cell: (l) => <PropertyRoomCell room={l.room} /> },
    { key: "term", header: "Term", cell: (l) => <span className="text-sm">{formatDate(l.startDate)} → {l.endDate ? formatDate(l.endDate) : "open"}</span> },
    { key: "rent", header: "Rent", hideOnMobile: true, cell: (l) => <span className="font-medium">{formatCurrency(l.monthlyRent)}</span> },
    { key: "status", header: "Status", cell: (l) => <StatusBadge status={l.status} /> },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (l) =>
        l.status === "ACTIVE" ? (
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="ghost" className="text-destructive">
                <Ban /> Terminate
              </Button>
            }
            title={`Terminate ${l.tenant.name}'s lease?`}
            description="The lease ends immediately and the tenant can no longer pay rent against it. This can't be undone."
            confirmLabel="Terminate lease"
            destructive
            onConfirm={() => terminate.mutateAsync(l.id)}
          />
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <ListToolbar>
        <FilterSelect paramKey="status" options={LEASE_STATUSES} placeholder="Status" allLabel="All leases" />
        <FilterSelect paramKey="sort" options={SORTS} placeholder="Sort" defaultValue="createdAt:desc" />
      </ListToolbar>
      <DataTable
        columns={columns}
        data={data?.data}
        isLoading={isLoading}
        rowKey={(l) => l.id}
        emptyState={<EmptyState icon={FileSignature} title="No leases found" description={get("status") ? "Nothing matches this filter." : "Leases you create from approved applications appear here."} />}
      />
      {data && <PaginationControls meta={data.meta} itemLabel="leases" />}
    </div>
  );
}
