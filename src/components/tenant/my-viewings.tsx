"use client";

import { CalendarCheck, X } from "lucide-react";
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
import { formatDate, formatRelative } from "@/lib/format";
import { VIEWING_STATUSES, type ViewingRequest } from "@/types/api";

const SORTS = [
  { value: "requestedDate:desc", label: "Viewing date (latest)" },
  { value: "requestedDate:asc", label: "Viewing date (soonest)" },
  { value: "createdAt:desc", label: "Recently requested" },
];

export function MyViewings() {
  const { get, page } = useQueryParams();
  const query = { page, limit: 10, status: get("status"), ...parseSort(get("sort"), "requestedDate:desc") };
  const { data, isLoading } = useListQuery<ViewingRequest>(["viewing-requests", "mine"], "/viewing-requests/my-requests", query);

  const cancel = useApiAction((id: string) => api.patch(`/viewing-requests/${id}/cancel`, {}), {
    success: "Viewing request cancelled",
    invalidate: [["viewing-requests"]],
  });

  const columns: Column<ViewingRequest>[] = [
    { key: "property", header: "Property", cell: (v) => <PropertyRoomCell property={v.property} room={v.room} /> },
    {
      key: "date",
      header: "Viewing",
      cell: (v) => (
        <div>
          <p className="font-medium">{formatDate(v.requestedDate)}</p>
          <p className="text-xs text-muted-foreground">{v.requestedTime ?? "Any time"}</p>
        </div>
      ),
    },
    { key: "message", header: "Message", hideOnMobile: true, cell: (v) => <p className="line-clamp-2 max-w-xs text-sm text-muted-foreground">{v.message ?? "—"}</p> },
    { key: "requested", header: "Requested", hideOnMobile: true, cell: (v) => <span className="text-sm text-muted-foreground">{formatRelative(v.createdAt)}</span> },
    { key: "status", header: "Status", cell: (v) => <StatusBadge status={v.status} /> },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (v) =>
        v.status === "PENDING" ? (
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" className="text-destructive">
                <X /> Cancel
              </Button>
            }
            title="Cancel this viewing request?"
            description="The owner will no longer see this request. You can always request a new viewing later."
            confirmLabel="Cancel request"
            destructive
            onConfirm={() => cancel.mutateAsync(v.id)}
          />
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <ListToolbar>
        <FilterSelect paramKey="status" options={VIEWING_STATUSES} placeholder="Status" allLabel="All statuses" />
        <FilterSelect paramKey="sort" options={SORTS} placeholder="Sort" defaultValue="requestedDate:desc" className="sm:w-52" />
      </ListToolbar>
      <DataTable
        columns={columns}
        data={data?.data}
        isLoading={isLoading}
        rowKey={(v) => v.id}
        emptyState={
          <EmptyState
            icon={CalendarCheck}
            title="No viewing requests found"
            description={get("status") ? "No requests match this filter." : "Find a room you like and request a viewing to see it in person."}
            action={
              <Button asChild>
                <Link href="/properties">Browse rooms</Link>
              </Button>
            }
          />
        }
      />
      {data && <PaginationControls meta={data.meta} itemLabel="requests" />}
    </div>
  );
}
