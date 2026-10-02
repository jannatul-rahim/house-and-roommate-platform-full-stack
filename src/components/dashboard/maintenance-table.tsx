"use client";

import { CheckCircle2, Lock, Play, Wrench } from "lucide-react";
import { PersonCell, PropertyRoomCell } from "@/components/dashboard/cells";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { api, useApiAction, useListQuery } from "@/hooks/use-api";
import { parseSort, useQueryParams } from "@/hooks/use-query-params";
import { formatRelative } from "@/lib/format";
import { MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES, type MaintenanceRequest } from "@/types/api";

const SORTS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "priority:desc", label: "Priority" },
  { value: "updatedAt:desc", label: "Recently updated" },
];

// The API's state machine: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED.
const NEXT_STEP = {
  OPEN: { action: "start", label: "Start work", icon: Play, success: "Marked as in progress" },
  IN_PROGRESS: { action: "resolve", label: "Mark resolved", icon: CheckCircle2, success: "Marked as resolved" },
  RESOLVED: { action: "close", label: "Close", icon: Lock, success: "Request closed" },
} as const;

/** Tenants (`mine`) see their own tickets; owners/admins (`managed`) can progress them. */
export function MaintenanceTable({ scope }: { scope: "mine" | "managed" }) {
  const { get, page } = useQueryParams();
  const query = {
    page,
    limit: 10,
    status: get("status"),
    priority: get("priority"),
    search: get("search"),
    ...parseSort(get("sort"), "createdAt:desc"),
  };
  const path = scope === "mine" ? "/maintenance-requests/my-requests" : "/maintenance-requests/managed";
  const { data, isLoading } = useListQuery<MaintenanceRequest>(["maintenance", scope], path, query);

  const transition = useApiAction(
    ({ id, action }: { id: string; action: string }) => api.post(`/maintenance-requests/${id}/${action}`),
    { success: "Maintenance request updated", invalidate: [["maintenance"]] },
  );

  const columns: Column<MaintenanceRequest>[] = [
    {
      key: "issue",
      header: "Issue",
      cell: (m) => (
        <div className="max-w-xs">
          <p className="font-medium">{m.title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{m.description}</p>
        </div>
      ),
    },
    ...(scope === "managed" ? [{ key: "tenant", header: "Tenant", hideOnMobile: true, cell: (m: MaintenanceRequest) => <PersonCell user={m.tenant} /> }] : []),
    { key: "property", header: "Location", hideOnMobile: true, cell: (m) => <PropertyRoomCell property={m.property} room={m.room} /> },
    { key: "priority", header: "Priority", cell: (m) => <StatusBadge status={m.priority} /> },
    { key: "status", header: "Status", cell: (m) => <StatusBadge status={m.status} /> },
    { key: "updated", header: "Updated", hideOnMobile: true, cell: (m) => <span className="text-sm text-muted-foreground">{formatRelative(m.updatedAt)}</span> },
    ...(scope === "managed"
      ? [
          {
            key: "actions",
            header: <span className="sr-only">Actions</span>,
            className: "text-right",
            cell: (m: MaintenanceRequest) => {
              const step = m.status in NEXT_STEP ? NEXT_STEP[m.status as keyof typeof NEXT_STEP] : null;
              if (!step) return null;
              const pending = transition.isPending && transition.variables?.id === m.id;
              return (
                <Button size="sm" variant="outline" disabled={pending} onClick={() => transition.mutate({ id: m.id, action: step.action })}>
                  <step.icon /> {step.label}
                </Button>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <ListToolbar>
        <SearchInput placeholder="Search issues" />
        <FilterSelect paramKey="status" options={MAINTENANCE_STATUSES} placeholder="Status" allLabel="All statuses" />
        <FilterSelect paramKey="priority" options={MAINTENANCE_PRIORITIES} placeholder="Priority" allLabel="All priorities" />
        <FilterSelect paramKey="sort" options={SORTS} placeholder="Sort" defaultValue="createdAt:desc" />
      </ListToolbar>
      <DataTable
        columns={columns}
        data={data?.data}
        isLoading={isLoading}
        rowKey={(m) => m.id}
        emptyState={
          <EmptyState
            icon={Wrench}
            title="No maintenance requests"
            description={Object.keys(query).some((k) => k !== "page" && k !== "limit" && k !== "sortBy" && k !== "sortOrder" && query[k as keyof typeof query]) ? "Nothing matches these filters." : scope === "mine" ? "Everything working? Great! Report an issue any time." : "No open issues across your properties."}
          />
        }
      />
      {data && <PaginationControls meta={data.meta} itemLabel="requests" />}
    </div>
  );
}
