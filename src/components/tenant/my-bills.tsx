"use client";

import { useQuery } from "@tanstack/react-query";
import { ReceiptText } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatusBadge } from "@/components/shared/status-badge";
import { api, useListQuery } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { parseSort, useQueryParams } from "@/hooks/use-query-params";
import { formatCurrency, formatDate, humanize } from "@/lib/format";
import { UTILITY_BILL_STATUSES, UTILITY_TYPES, type UtilityBill, type UtilityBillSplit } from "@/types/api";

/** The list endpoint omits splits, so each row loads the tenant's own share. */
function useMySplit(billId: string) {
  return useQuery({
    queryKey: ["utility-bills", "splits", billId],
    queryFn: () => api.get<UtilityBillSplit[]>(`/utility-bills/${billId}/splits`),
    select: (splits) => splits[0] ?? null,
  });
}

function ShareCell({ billId }: { billId: string }) {
  const { data, isLoading } = useMySplit(billId);
  if (isLoading) return <Skeleton className="h-5 w-16" />;
  return <span className="font-semibold text-primary">{data ? formatCurrency(data.amount) : "—"}</span>;
}

function ShareStatusCell({ bill }: { bill: UtilityBill }) {
  const { data } = useMySplit(bill.id);
  return <StatusBadge status={data?.status ?? bill.status} />;
}

const SORTS = [
  { value: "dueDate:asc", label: "Due soonest" },
  { value: "createdAt:desc", label: "Newest first" },
  { value: "totalAmount:desc", label: "Amount (high–low)" },
];

export function MyBills() {
  const { get, page } = useQueryParams();
  const query = { page, limit: 10, status: get("status"), type: get("type"), ...parseSort(get("sort"), "dueDate:asc") };
  const { data, isLoading } = useListQuery<UtilityBill>(["utility-bills", "mine"], "/utility-bills/my-bills", query);

  const columns: Column<UtilityBill>[] = [
    {
      key: "type",
      header: "Utility",
      cell: (b) => (
        <div>
          <p className="font-medium">{humanize(b.type)}</p>
          <p className="text-xs text-muted-foreground">{b.property.title}</p>
        </div>
      ),
    },
    { key: "period", header: "Billing period", hideOnMobile: true, cell: (b) => <span className="text-sm">{formatDate(b.billingPeriodStart)} – {formatDate(b.billingPeriodEnd)}</span> },
    { key: "total", header: "Total bill", hideOnMobile: true, cell: (b) => <span className="text-sm text-muted-foreground">{formatCurrency(b.totalAmount)}</span> },
    {
      key: "share",
      header: "Your share",
      cell: (b) => <ShareCell billId={b.id} />,
    },
    { key: "due", header: "Due", cell: (b) => <span className="text-sm">{formatDate(b.dueDate)}</span> },
    { key: "status", header: "Status", cell: (b) => <ShareStatusCell bill={b} /> },
  ];

  return (
    <div className="space-y-4">
      <ListToolbar>
        <FilterSelect paramKey="type" options={UTILITY_TYPES} placeholder="Utility" allLabel="All utilities" />
        <FilterSelect paramKey="status" options={UTILITY_BILL_STATUSES} placeholder="Status" allLabel="All statuses" />
        <FilterSelect paramKey="sort" options={SORTS} placeholder="Sort" defaultValue="dueDate:asc" />
      </ListToolbar>
      <DataTable
        columns={columns}
        data={data?.data}
        isLoading={isLoading}
        rowKey={(b) => b.id}
        emptyState={<EmptyState icon={ReceiptText} title="No utility bills" description="When your landlord splits a utility bill with you, your share appears here." />}
      />
      {data && <PaginationControls meta={data.meta} itemLabel="bills" />}
    </div>
  );
}
