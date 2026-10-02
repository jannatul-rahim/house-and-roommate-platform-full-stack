"use client";

import { ScrollText } from "lucide-react";
import { useState } from "react";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useListQuery } from "@/hooks/use-api";
import { useQueryParams } from "@/hooks/use-query-params";
import { dateInputToIso, formatDateTime, humanize } from "@/lib/format";
import type { AuditLog } from "@/types/api";

const ACTIONS = [
  "PROPERTY_CREATED", "PROPERTY_UPDATED", "PROPERTY_DELETED", "PROPERTY_MANAGER_ASSIGNED", "PROPERTY_MANAGER_REMOVED",
  "BUILDING_DELETED", "UNIT_DELETED", "ROOM_DELETED", "AVAILABILITY_DELETED", "ROOMMATE_PROFILE_DELETED",
  "VIEWING_REQUEST_APPROVED", "VIEWING_REQUEST_REJECTED", "VIEWING_REQUEST_CANCELLED",
  "APPLICATION_APPROVED", "APPLICATION_REJECTED", "APPLICATION_WITHDRAWN", "LEASE_CREATED", "LEASE_TERMINATED",
  "PAYMENT_CREATED", "PAYMENT_STATUS_CHANGED", "UTILITY_BILL_CREATED", "UTILITY_SPLIT_CREATED",
  "MAINTENANCE_REQUEST_CREATED", "MAINTENANCE_REQUEST_STARTED", "MAINTENANCE_REQUEST_RESOLVED", "MAINTENANCE_REQUEST_CLOSED",
] as const;

const ENTITIES = [
  "PROPERTY", "BUILDING", "UNIT", "ROOM", "ROOM_AVAILABILITY", "ROOMMATE_PROFILE", "VIEWING_REQUEST",
  "APPLICATION", "LEASE", "PAYMENT", "UTILITY_BILL", "UTILITY_BILL_SPLIT", "MAINTENANCE_REQUEST",
] as const;

function actionTone(action: string) {
  if (/DELETED|REJECTED|TERMINATED|CANCELLED|WITHDRAWN/.test(action)) return "destructive" as const;
  if (/CREATED|APPROVED|RESOLVED/.test(action)) return "default" as const;
  return "secondary" as const;
}

function DateFilter({ paramKey, label }: { paramKey: "from" | "to"; label: string }) {
  const { get, setParams } = useQueryParams();
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      {label}
      <Input type="date" value={get(paramKey) ?? ""} onChange={(e) => setParams({ [paramKey]: e.target.value || null })} className="h-9 w-40" />
    </label>
  );
}

/** Immutable audit trail with URL-synced action / entity / date filters. */
export function AuditLogs() {
  const { get, page } = useQueryParams();
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const from = get("from");
  const to = get("to");
  const query = {
    page,
    limit: 20,
    action: get("action"),
    entityType: get("entityType"),
    from: from ? dateInputToIso(from) : undefined,
    to: to ? dateInputToIso(to, true) : undefined,
    sortOrder: get("order") === "asc" ? "asc" : "desc",
  };
  const { data, isLoading } = useListQuery<AuditLog>(["audit-logs"], "/audit-logs", query);

  const columns: Column<AuditLog>[] = [
    { key: "when", header: "When", cell: (l) => <span className="text-sm whitespace-nowrap">{formatDateTime(l.createdAt)}</span> },
    { key: "action", header: "Action", cell: (l) => <Badge variant={actionTone(l.action)}>{humanize(l.action)}</Badge> },
    { key: "entity", header: "Entity", hideOnMobile: true, cell: (l) => <span className="text-sm">{humanize(l.entityType)} <code className="text-xs text-muted-foreground">{l.entityId.slice(0, 8)}</code></span> },
    {
      key: "actor",
      header: "Actor",
      hideOnMobile: true,
      cell: (l) =>
        l.actor ? (
          <div className="flex items-center gap-2">
            <UserAvatar name={l.actor.name} className="size-7" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{l.actor.name}</p>
              <p className="truncate text-xs text-muted-foreground">{l.actor.email}</p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">System</span>
        ),
    },
    {
      key: "details",
      header: <span className="sr-only">Details</span>,
      className: "text-right",
      cell: (l) => (
        <Button size="sm" variant="ghost" onClick={() => setSelected(l)}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ListToolbar>
        <FilterSelect paramKey="action" options={ACTIONS} placeholder="Action" allLabel="All actions" className="sm:w-56" />
        <FilterSelect paramKey="entityType" options={ENTITIES} placeholder="Entity" allLabel="All entities" />
        <DateFilter paramKey="from" label="From" />
        <DateFilter paramKey="to" label="To" />
        <FilterSelect paramKey="order" options={[{ value: "desc", label: "Newest first" }, { value: "asc", label: "Oldest first" }]} placeholder="Order" defaultValue="desc" />
      </ListToolbar>
      <DataTable
        columns={columns}
        data={data?.data}
        isLoading={isLoading}
        rowKey={(l) => l.id}
        emptyState={<EmptyState icon={ScrollText} title="No audit entries" description="No recorded actions match these filters." />}
      />
      {data && <PaginationControls meta={data.meta} itemLabel="entries" />}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selected && humanize(selected.action)}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                {formatDateTime(selected.createdAt)} · {humanize(selected.entityType)} <code>{selected.entityId}</code>
              </p>
              {(["metadata", "oldValue", "newValue"] as const).map((field) =>
                selected[field] ? (
                  <div key={field}>
                    <p className="mb-1 font-medium">{humanize(field.replace(/([A-Z])/g, "_$1"))}</p>
                    <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs">{JSON.stringify(selected[field], null, 2)}</pre>
                  </div>
                ) : null,
              )}
              {!selected.metadata && !selected.oldValue && !selected.newValue && <p className="text-muted-foreground">No additional data was recorded for this action.</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
