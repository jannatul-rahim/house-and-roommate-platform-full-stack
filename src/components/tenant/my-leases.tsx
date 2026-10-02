"use client";

import { CalendarRange, FileSignature, Wrench } from "lucide-react";
import Link from "next/link";
import { PropertyRoomCell } from "@/components/dashboard/cells";
import { PayRentButton } from "@/components/dashboard/pay-rent-button";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useListQuery } from "@/hooks/use-api";
import { useQueryParams } from "@/hooks/use-query-params";
import { formatCurrency, formatDate } from "@/lib/format";
import { LEASE_STATUSES, type Lease } from "@/types/api";

export function MyLeases() {
  const { get, page } = useQueryParams();
  const query = { page, limit: 6, status: get("status"), sortBy: "createdAt", sortOrder: "desc" };
  const { data, isLoading } = useListQuery<Lease>(["leases", "mine"], "/leases/my-leases", query);

  return (
    <div className="space-y-4">
      <ListToolbar>
        <FilterSelect paramKey="status" options={LEASE_STATUSES} placeholder="Status" allLabel="All leases" />
      </ListToolbar>
      {isLoading ? (
        <CardGridSkeleton count={2} />
      ) : data && data.data.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.data.map((lease) => (
            <Card key={lease.id} className="gap-0 py-0">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <PropertyRoomCell room={lease.room} />
                  <StatusBadge status={lease.status} />
                </div>
                <dl className="grid grid-cols-3 gap-3 rounded-xl bg-muted/50 p-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Monthly rent</dt>
                    <dd className="font-semibold">{formatCurrency(lease.monthlyRent)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Deposit</dt>
                    <dd className="font-semibold">{formatCurrency(lease.securityDeposit)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">City</dt>
                    <dd className="font-semibold">{lease.room.unit.building.property?.city ?? "—"}</dd>
                  </div>
                </dl>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarRange className="size-4" aria-hidden /> {formatDate(lease.startDate)} → {lease.endDate ? formatDate(lease.endDate) : "open-ended"}
                </p>
                {lease.status === "ACTIVE" && (
                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    <PayRentButton leaseId={lease.id} amount={lease.monthlyRent} />
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/maintenance">
                        <Wrench /> Report an issue
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileSignature}
          title="No leases found"
          description="Leases are created by the owner after your application is approved."
          action={
            <Button asChild variant="outline">
              <Link href="/dashboard/applications">Check my applications</Link>
            </Button>
          }
        />
      )}
      {data && <PaginationControls meta={data.meta} itemLabel="leases" />}
    </div>
  );
}
