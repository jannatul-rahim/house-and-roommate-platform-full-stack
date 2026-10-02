"use client";

import { CreditCard } from "lucide-react";
import { PersonCell, PropertyRoomCell } from "@/components/dashboard/cells";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatusBadge } from "@/components/shared/status-badge";
import { useListQuery } from "@/hooks/use-api";
import { parseSort, useQueryParams } from "@/hooks/use-query-params";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { PAYMENT_STATUSES, type Payment } from "@/types/api";

const SORTS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "amount:desc", label: "Amount (high–low)" },
  { value: "paidAt:desc", label: "Recently paid" },
];

/** Payment history for tenants (`mine`) or owners/admins (`managed`). */
export function PaymentsTable({ scope }: { scope: "mine" | "managed" }) {
  const { get, page } = useQueryParams();
  const query = { page, limit: 10, status: get("status"), ...parseSort(get("sort"), "createdAt:desc") };
  const path = scope === "mine" ? "/payments/my-payments" : "/payments/managed";
  const { data, isLoading } = useListQuery<Payment>(["payments", scope], path, query);

  const columns: Column<Payment>[] = [
    ...(scope === "managed" ? [{ key: "tenant", header: "Tenant", cell: (p: Payment) => <PersonCell user={p.tenant} /> }] : []),
    { key: "property", header: "Property", cell: (p) => <PropertyRoomCell room={p.lease.room} /> },
    { key: "amount", header: "Amount", cell: (p) => <span className="font-semibold">{formatCurrency(p.amount)}</span> },
    { key: "created", header: "Initiated", hideOnMobile: true, cell: (p) => <span className="text-sm">{formatDate(p.createdAt)}</span> },
    { key: "paid", header: "Paid at", hideOnMobile: true, cell: (p) => <span className="text-sm text-muted-foreground">{p.paidAt ? formatDateTime(p.paidAt) : "—"}</span> },
    { key: "method", header: "Method", hideOnMobile: true, cell: (p) => <span className="text-sm">{p.provider ? `${p.provider === "STRIPE" ? "Stripe" : p.provider} · Card` : "—"}</span> },
    { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div className="space-y-4">
      <ListToolbar>
        <FilterSelect paramKey="status" options={PAYMENT_STATUSES} placeholder="Status" allLabel="All payments" />
        <FilterSelect paramKey="sort" options={SORTS} placeholder="Sort" defaultValue="createdAt:desc" />
      </ListToolbar>
      <DataTable
        columns={columns}
        data={data?.data}
        isLoading={isLoading}
        rowKey={(p) => p.id}
        emptyState={
          <EmptyState
            icon={CreditCard}
            title="No payments found"
            description={get("status") ? "No payments match this filter." : scope === "mine" ? "Rent you pay through Stripe will show up here." : "Rent payments from your tenants will show up here."}
          />
        }
      />
      {data && <PaginationControls meta={data.meta} itemLabel="payments" />}
    </div>
  );
}
