"use client";

import { FileText, Undo2 } from "lucide-react";
import Link from "next/link";
import { PropertyRoomCell } from "@/components/dashboard/cells";
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
import { APPLICATION_STATUSES, type Application } from "@/types/api";

const SORTS = [
  { value: "submittedAt:desc", label: "Newest first" },
  { value: "submittedAt:asc", label: "Oldest first" },
  { value: "status:asc", label: "Status" },
];

export function MyApplications() {
  const { get, page } = useQueryParams();
  const query = { page, limit: 10, status: get("status"), ...parseSort(get("sort"), "submittedAt:desc") };
  const { data, isLoading } = useListQuery<Application>(["applications", "mine"], "/applications/my-applications", query);

  const withdraw = useApiAction((id: string) => api.patch(`/applications/${id}/withdraw`, {}), {
    success: "Application withdrawn",
    invalidate: [["applications"]],
  });

  const columns: Column<Application>[] = [
    { key: "property", header: "Property", cell: (a) => <PropertyRoomCell property={a.property} room={a.room} /> },
    { key: "rent", header: "Rent", hideOnMobile: true, cell: (a) => <span className="font-medium">{formatCurrency(a.room.monthlyRent ?? null)}</span> },
    {
      key: "viewing",
      header: "Viewing",
      hideOnMobile: true,
      cell: (a) => (a.viewingRequest ? <span className="text-sm">Viewed {formatDate(a.viewingRequest.requestedDate)}</span> : <span className="text-sm text-muted-foreground">No viewing</span>),
    },
    { key: "submitted", header: "Submitted", cell: (a) => <span className="text-sm">{formatDate(a.submittedAt)}</span> },
    { key: "status", header: "Status", cell: (a) => <StatusBadge status={a.status} /> },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (a) =>
        a.status === "PENDING" ? (
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" className="text-destructive">
                <Undo2 /> Withdraw
              </Button>
            }
            title="Withdraw this application?"
            description="The owner will stop reviewing it. You can submit a new application for the room afterwards."
            confirmLabel="Withdraw"
            destructive
            onConfirm={() => withdraw.mutateAsync(a.id)}
          />
        ) : a.status === "APPROVED" ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/leases">View lease</Link>
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <ListToolbar>
        <FilterSelect paramKey="status" options={APPLICATION_STATUSES} placeholder="Status" allLabel="All statuses" />
        <FilterSelect paramKey="sort" options={SORTS} placeholder="Sort" defaultValue="submittedAt:desc" />
      </ListToolbar>
      <DataTable
        columns={columns}
        data={data?.data}
        isLoading={isLoading}
        rowKey={(a) => a.id}
        emptyState={
          <EmptyState
            icon={FileText}
            title="No applications found"
            description={get("status") ? "No applications match this filter." : "Apply for a room from any listing page to get started."}
            action={
              <Button asChild>
                <Link href="/properties">Find a room</Link>
              </Button>
            }
          />
        }
      />
      {data && <PaginationControls meta={data.meta} itemLabel="applications" />}
    </div>
  );
}
