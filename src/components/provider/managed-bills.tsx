"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ReceiptText, Split } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PersonCell } from "@/components/dashboard/cells";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { FormDialog } from "@/components/shared/form-dialog";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api, useListQuery } from "@/hooks/use-api";
import { parseSort, useQueryParams } from "@/hooks/use-query-params";
import { dateInputToIso, formatCurrency, formatDate, humanize, toDateInputValue } from "@/lib/format";
import { UTILITY_BILL_STATUSES, UTILITY_TYPES, type Lease, type Property, type UtilityBill, type UtilityBillSplit } from "@/types/api";

const moneyString = z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 1500").refine((v) => Number(v) > 0, "Amount must be greater than 0");

// Mirrors CreateUtilityBillZodSchema (totalAmount must be a string).
const billSchema = z
  .object({
    propertyId: z.string().uuid("Choose a property"),
    type: z.enum(UTILITY_TYPES),
    totalAmount: moneyString,
    billingPeriodStart: z.string().min(1, "Start date is required"),
    billingPeriodEnd: z.string().min(1, "End date is required"),
    dueDate: z.string().min(1, "Due date is required"),
  })
  .refine((d) => d.billingPeriodStart < d.billingPeriodEnd, { message: "Period end must be after the start", path: ["billingPeriodEnd"] });

const splitSchema = z.object({ tenantId: z.string().uuid("Choose a tenant"), amount: moneyString });

const SORTS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "dueDate:asc", label: "Due soonest" },
  { value: "totalAmount:desc", label: "Amount (high–low)" },
];

function SplitsDialog({ bill }: { bill: UtilityBill }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const key = ["utility-bills", "splits", bill.id];
  const splits = useQuery({ queryKey: key, queryFn: () => api.get<UtilityBillSplit[]>(`/utility-bills/${bill.id}/splits`), enabled: open });
  // Candidates: tenants with an active lease at this property.
  const tenants = useQuery({
    queryKey: ["leases", "managed", "active", bill.propertyId],
    queryFn: () => api.list<Lease>("/leases/managed", { status: "ACTIVE", propertyId: bill.propertyId, limit: 100 }),
    enabled: open,
  });
  const allocated = splits.data?.reduce((sum, s) => sum + s.amount, 0) ?? 0;
  const options = (tenants.data?.data ?? [])
    .filter((l, i, arr) => arr.findIndex((x) => x.tenantId === l.tenantId) === i)
    .filter((l) => !splits.data?.some((s) => s.tenantId === l.tenantId))
    .map((l) => ({ value: l.tenantId, label: `${l.tenant.name} — Room ${l.room.roomNumber}` }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Split /> Splits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {humanize(bill.type)} bill · {formatCurrency(bill.totalAmount)}
          </DialogTitle>
          <DialogDescription>
            {formatCurrency(allocated)} of {formatCurrency(bill.totalAmount)} allocated to tenants.
          </DialogDescription>
        </DialogHeader>
        <div className="h-2 rounded-full bg-muted">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (allocated / bill.totalAmount) * 100)}%` }} />
        </div>
        {splits.isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : splits.data?.length ? (
          <ul className="divide-y rounded-xl border">
            {splits.data.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 p-3">
                {s.tenant ? <PersonCell user={s.tenant} /> : <span className="text-sm">Tenant</span>}
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatCurrency(s.amount)}</span>
                  <StatusBadge status={s.status} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">No splits yet.</p>
        )}
        <FormDialog
          trigger={
            <Button disabled={!options.length || allocated >= bill.totalAmount}>
              <Plus /> Add tenant share
            </Button>
          }
          title="Split with a tenant"
          description={`Remaining: ${formatCurrency(bill.totalAmount - allocated)}`}
          schema={splitSchema}
          defaultValues={{ tenantId: "", amount: "" }}
          fields={[
            { name: "tenantId", label: "Tenant", type: "select", options, required: true, wide: true, placeholder: "Choose a tenant" },
            { name: "amount", label: "Share (৳)", type: "number", required: true, wide: true },
          ]}
          submitLabel="Add share"
          onSubmit={async (v) => {
            await api.post(`/utility-bills/${bill.id}/splits`, v);
            toast.success("Share added");
            await queryClient.invalidateQueries({ queryKey: key });
          }}
        />
        {tenants.isSuccess && !tenants.data.data.length && <p className="text-xs text-muted-foreground">No tenants have an active lease at this property yet.</p>}
      </DialogContent>
    </Dialog>
  );
}

export function CreateBillButton() {
  const queryClient = useQueryClient();
  const properties = useQuery({ queryKey: ["properties", "mine", "options"], queryFn: () => api.list<Property>("/properties/my-properties", { limit: 100 }) });
  const today = new Date();
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const inTwoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  return (
    <FormDialog
      trigger={
        <Button>
          <Plus /> New bill
        </Button>
      }
      title="Record a utility bill"
      description="Bills are in BDT. Split them between tenants afterwards."
      schema={billSchema}
      defaultValues={{
        propertyId: "",
        type: "ELECTRICITY",
        totalAmount: "",
        billingPeriodStart: toDateInputValue(monthAgo),
        billingPeriodEnd: toDateInputValue(today),
        dueDate: toDateInputValue(inTwoWeeks),
      }}
      fields={[
        { name: "propertyId", label: "Property", type: "select", options: (properties.data?.data ?? []).map((p) => ({ value: p.id, label: p.title })), required: true, wide: true, placeholder: "Choose a property" },
        { name: "type", label: "Utility", type: "select", options: UTILITY_TYPES },
        { name: "totalAmount", label: "Total (৳)", type: "number", required: true },
        { name: "billingPeriodStart", label: "Period start", type: "date", required: true },
        { name: "billingPeriodEnd", label: "Period end", type: "date", required: true },
        { name: "dueDate", label: "Due date", type: "date", required: true, wide: true },
      ]}
      submitLabel="Create bill"
      onSubmit={async (v) => {
        await api.post("/utility-bills", {
          ...v,
          billingPeriodStart: dateInputToIso(v.billingPeriodStart),
          billingPeriodEnd: dateInputToIso(v.billingPeriodEnd, true),
          dueDate: dateInputToIso(v.dueDate, true),
        });
        toast.success("Utility bill recorded");
        await queryClient.invalidateQueries({ queryKey: ["utility-bills"] });
      }}
    />
  );
}

export function ManagedBills() {
  const { get, page } = useQueryParams();
  const query = { page, limit: 10, status: get("status"), type: get("type"), ...parseSort(get("sort"), "createdAt:desc") };
  const { data, isLoading } = useListQuery<UtilityBill>(["utility-bills", "managed"], "/utility-bills/managed", query);

  const columns: Column<UtilityBill>[] = [
    {
      key: "bill",
      header: "Bill",
      cell: (b) => (
        <div>
          <p className="font-medium">{humanize(b.type)}</p>
          <p className="text-xs text-muted-foreground">
            {b.property.title}
            {b.unit ? ` · Unit ${b.unit.unitNumber}` : ""}
          </p>
        </div>
      ),
    },
    { key: "period", header: "Period", hideOnMobile: true, cell: (b) => <span className="text-sm">{formatDate(b.billingPeriodStart)} – {formatDate(b.billingPeriodEnd)}</span> },
    { key: "amount", header: "Total", cell: (b) => <span className="font-semibold">{formatCurrency(b.totalAmount)}</span> },
    { key: "due", header: "Due", hideOnMobile: true, cell: (b) => <span className="text-sm">{formatDate(b.dueDate)}</span> },
    { key: "status", header: "Status", cell: (b) => <StatusBadge status={b.status} /> },
    { key: "actions", header: <span className="sr-only">Actions</span>, className: "text-right", cell: (b) => <SplitsDialog bill={b} /> },
  ];

  return (
    <div className="space-y-4">
      <ListToolbar>
        <FilterSelect paramKey="type" options={UTILITY_TYPES} placeholder="Utility" allLabel="All utilities" />
        <FilterSelect paramKey="status" options={UTILITY_BILL_STATUSES} placeholder="Status" allLabel="All statuses" />
        <FilterSelect paramKey="sort" options={SORTS} placeholder="Sort" defaultValue="createdAt:desc" />
      </ListToolbar>
      <DataTable
        columns={columns}
        data={data?.data}
        isLoading={isLoading}
        rowKey={(b) => b.id}
        emptyState={<EmptyState icon={ReceiptText} title="No utility bills" description="Record electricity, gas, water or internet bills and split them between tenants." />}
      />
      {data && <PaginationControls meta={data.meta} itemLabel="bills" />}
    </div>
  );
}
