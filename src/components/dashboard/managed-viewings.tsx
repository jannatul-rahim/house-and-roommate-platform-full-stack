"use client";

import { CalendarCheck, Check, X } from "lucide-react";
import { PersonCell, PropertyRoomCell } from "@/components/dashboard/cells";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api, useApiAction, useListQuery } from "@/hooks/use-api";
import { parseSort, useQueryParams } from "@/hooks/use-query-params";
import { formatDate, formatRelative } from "@/lib/format";
import { VIEWING_STATUSES, type ViewingRequest } from "@/types/api";

const SORTS = [
  { value: "requestedDate:asc", label: "Viewing date (soonest)" },
  { value: "requestedDate:desc", label: "Viewing date (latest)" },
  { value: "createdAt:desc", label: "Recently requested" },
];

/** Viewing requests for properties the caller owns/manages (admins see all). */
export function ManagedViewings() {
  const { get, page } = useQueryParams();
  const query = { page, limit: 10, status: get("status"), ...parseSort(get("sort"), "requestedDate:asc") };
  const { data, isLoading } = useListQuery<ViewingRequest>(["viewing-requests", "managed"], "/viewing-requests/managed", query);

  const act = useApiAction(({ id, action }: { id: string; action: "approve" | "reject" }) => api.patch(`/viewing-requests/${id}/${action}`, {}), {
    success: "Viewing request updated",
    invalidate: [["viewing-requests"]],
  });

  const columns: Column<ViewingRequest>[] = [
    { key: "tenant", header: "Tenant", cell: (v) => <PersonCell user={v.tenant} subtitle={`Requested ${formatRelative(v.createdAt)}`} /> },
    { key: "property", header: "Room", hideOnMobile: true, cell: (v) => <PropertyRoomCell property={v.property} room={v.room} /> },
    {
      key: "when",
      header: "Viewing",
      cell: (v) => (
        <div>
          <p className="font-medium">{formatDate(v.requestedDate)}</p>
          <p className="text-xs text-muted-foreground">{v.requestedTime ?? "Any time"}</p>
        </div>
      ),
    },
    {
      key: "message",
      header: "Message",
      hideOnMobile: true,
      cell: (v) =>
        v.message ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="line-clamp-1 max-w-48 cursor-help text-sm text-muted-foreground">{v.message}</p>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{v.message}</TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    { key: "status", header: "Status", cell: (v) => <StatusBadge status={v.status} /> },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (v) =>
        v.status === "PENDING" ? (
          <div className="flex justify-end gap-1">
            <Button size="sm" onClick={() => act.mutate({ id: v.id, action: "approve" })} disabled={act.isPending}>
              <Check /> Approve
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => act.mutate({ id: v.id, action: "reject" })} disabled={act.isPending}>
              <X /> Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <ListToolbar>
        <FilterSelect paramKey="status" options={VIEWING_STATUSES} placeholder="Status" allLabel="All statuses" />
        <FilterSelect paramKey="sort" options={SORTS} placeholder="Sort" defaultValue="requestedDate:asc" className="sm:w-52" />
      </ListToolbar>
      <DataTable
        columns={columns}
        data={data?.data}
        isLoading={isLoading}
        rowKey={(v) => v.id}
        emptyState={<EmptyState icon={CalendarCheck} title="No viewing requests" description={get("status") ? "Nothing matches this filter." : "When tenants ask to see a room, the request lands here."} />}
      />
      {data && <PaginationControls meta={data.meta} itemLabel="requests" />}
    </div>
  );
}
