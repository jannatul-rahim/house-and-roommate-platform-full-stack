"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, FileSignature, FileText, X } from "lucide-react";
import { z } from "zod";
import { PersonCell, PropertyRoomCell } from "@/components/dashboard/cells";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { FormDialog } from "@/components/shared/form-dialog";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, useApiAction, useListQuery } from "@/hooks/use-api";
import { parseSort, useQueryParams } from "@/hooks/use-query-params";
import { toast } from "sonner";
import { dateInputToIso, formatCurrency, formatDate, toDateInputValue } from "@/lib/format";
import { APPLICATION_STATUSES, type Application, type Lease } from "@/types/api";

const SORTS = [
  { value: "submittedAt:desc", label: "Newest first" },
  { value: "submittedAt:asc", label: "Oldest first" },
  { value: "status:asc", label: "Status" },
];

// Mirrors CreateLeaseZodSchema: start required, optional end after start.
const leaseSchema = z
  .object({ startDate: z.string().min(1, "Start date is required"), endDate: z.string().optional() })
  .refine((d) => !d.endDate || d.endDate > d.startDate, { message: "End date must be after the start date", path: ["endDate"] });

/** Applications for owned/managed properties; approve, reject and create the lease. */
export function ManagedApplications() {
  const { get, page } = useQueryParams();
  const queryClient = useQueryClient();
  const query = { page, limit: 10, status: get("status"), ...parseSort(get("sort"), "submittedAt:desc") };
  const { data, isLoading } = useListQuery<Application>(["applications", "managed"], "/applications/managed", query);

  // Approving does not create a lease in the API - track which approvals still need one.
  const leases = useQuery({
    queryKey: ["leases", "managed", "all"],
    queryFn: () => api.list<Lease>("/leases/managed", { limit: 100 }),
  });
  const leasedApplications = new Set(leases.data?.data.map((l) => l.applicationId));

  const act = useApiAction(({ id, action }: { id: string; action: "approve" | "reject" }) => api.patch(`/applications/${id}/${action}`, {}), {
    success: "Application updated",
    invalidate: [["applications"]],
  });

  const columns: Column<Application>[] = [
    { key: "tenant", header: "Applicant", cell: (a) => <PersonCell user={a.tenant} subtitle={`Submitted ${formatDate(a.submittedAt)}`} /> },
    { key: "room", header: "Room", hideOnMobile: true, cell: (a) => <PropertyRoomCell property={a.property} room={a.room} /> },
    { key: "rent", header: "Rent", hideOnMobile: true, cell: (a) => <span className="font-medium">{formatCurrency(a.room.monthlyRent ?? null)}</span> },
    {
      key: "viewing",
      header: "Viewing",
      hideOnMobile: true,
      cell: (a) => (a.viewingRequest ? <Badge variant="secondary">Viewed {formatDate(a.viewingRequest.requestedDate)}</Badge> : <span className="text-sm text-muted-foreground">—</span>),
    },
    { key: "status", header: "Status", cell: (a) => <StatusBadge status={a.status} /> },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (a) => {
        if (a.status === "PENDING") {
          return (
            <div className="flex justify-end gap-1">
              <Button size="sm" onClick={() => act.mutate({ id: a.id, action: "approve" })} disabled={act.isPending}>
                <Check /> Approve
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => act.mutate({ id: a.id, action: "reject" })} disabled={act.isPending}>
                <X /> Reject
              </Button>
            </div>
          );
        }
        if (a.status === "APPROVED" && leases.isSuccess && !leasedApplications.has(a.id)) {
          return (
            <FormDialog
              trigger={
                <Button size="sm" variant="outline">
                  <FileSignature /> Create lease
                </Button>
              }
              title={`Create lease for ${a.tenant.name}`}
              description={`Room ${a.room.roomNumber} · rent ${formatCurrency(a.room.monthlyRent ?? null)}/mo is copied from the room.`}
              schema={leaseSchema}
              defaultValues={{ startDate: toDateInputValue(new Date()), endDate: "" }}
              fields={[
                { name: "startDate", label: "Start date", type: "date", required: true },
                { name: "endDate", label: "End date", type: "date", description: "Leave empty for an open-ended lease." },
              ]}
              submitLabel="Create lease"
              onSubmit={async (v) => {
                await api.post("/leases", {
                  applicationId: a.id,
                  startDate: dateInputToIso(v.startDate),
                  endDate: v.endDate ? dateInputToIso(v.endDate, true) : undefined,
                });
                toast.success("Lease created — the tenant can now pay rent online");
                await queryClient.invalidateQueries({ queryKey: ["leases"] });
              }}
            />
          );
        }
        if (a.status === "APPROVED") return <Badge variant="outline">Lease active</Badge>;
        return null;
      },
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
        emptyState={<EmptyState icon={FileText} title="No applications" description={get("status") ? "Nothing matches this filter." : "Rental applications from tenants appear here."} />}
      />
      {data && <PaginationControls meta={data.meta} itemLabel="applications" />}
    </div>
  );
}
