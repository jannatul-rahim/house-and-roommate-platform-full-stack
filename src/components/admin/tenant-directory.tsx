"use client";

import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { PersonCell } from "@/components/dashboard/cells";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { api } from "@/hooks/use-api";
import { useQueryParams } from "@/hooks/use-query-params";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Application, Lease, Payment, UserSummary } from "@/types/api";

interface TenantRow {
  user: UserSummary;
  applications: number;
  activeLeases: number;
  paid: number;
  lastActivity: string;
}

/**
 * The API exposes no "list users" endpoint, so the directory is assembled from
 * platform-wide applications, leases and payments (admins see all of them).
 */
export function TenantDirectory() {
  const { get } = useQueryParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "tenant-directory"],
    queryFn: async () => {
      const [applications, leases, payments] = await Promise.all([
        api.list<Application>("/applications/managed", { limit: 100 }),
        api.list<Lease>("/leases/managed", { limit: 100 }),
        api.list<Payment>("/payments/managed", { limit: 100 }),
      ]);
      const rows = new Map<string, TenantRow>();
      const touch = (user: UserSummary, at: string) => {
        const row = rows.get(user.id) ?? { user, applications: 0, activeLeases: 0, paid: 0, lastActivity: at };
        if (at > row.lastActivity) row.lastActivity = at;
        rows.set(user.id, row);
        return row;
      };
      applications.data.forEach((a) => touch(a.tenant, a.submittedAt).applications++);
      leases.data.forEach((l) => {
        const row = touch(l.tenant, l.createdAt);
        if (l.status === "ACTIVE") row.activeLeases++;
      });
      payments.data.forEach((p) => {
        const row = touch(p.tenant, p.createdAt);
        if (p.status === "PAID") row.paid += p.amount;
      });
      return [...rows.values()].sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
    },
  });

  const search = get("search")?.toLowerCase();
  const status = get("status");
  const rows = (data ?? []).filter(
    (r) => (!search || r.user.name.toLowerCase().includes(search)) && (!status || (status === "ACTIVE" ? r.activeLeases > 0 : r.activeLeases === 0)),
  );

  const columns: Column<TenantRow>[] = [
    { key: "tenant", header: "Tenant", cell: (r) => <PersonCell user={r.user} /> },
    { key: "apps", header: "Applications", cell: (r) => <span className="font-medium">{r.applications}</span> },
    { key: "lease", header: "Tenancy", cell: (r) => <StatusBadge status={r.activeLeases > 0 ? "ACTIVE" : "PENDING"} /> },
    { key: "paid", header: "Rent paid", hideOnMobile: true, cell: (r) => <span className="text-sm">{formatCurrency(r.paid)}</span> },
    { key: "last", header: "Last activity", hideOnMobile: true, cell: (r) => <span className="text-sm text-muted-foreground">{formatDate(r.lastActivity)}</span> },
  ];

  return (
    <div className="space-y-4">
      <ListToolbar>
        <SearchInput placeholder="Search tenants by name" />
        <FilterSelect paramKey="status" options={[{ value: "ACTIVE", label: "Renting now" }, { value: "SEARCHING", label: "Still searching" }]} placeholder="Tenancy" allLabel="All tenants" />
      </ListToolbar>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        rowKey={(r) => r.user.id}
        emptyState={<EmptyState icon={Users} title="No tenants found" description={search || status ? "Nothing matches these filters." : "Tenants appear once they apply for a room."} />}
      />
      {!isLoading && <p className="text-sm text-muted-foreground">{rows.length} tenants</p>}
    </div>
  );
}
