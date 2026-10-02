"use client";

import { useQuery } from "@tanstack/react-query";
import { Banknote, CircleDollarSign, Clock, TrendingUp } from "lucide-react";
import { ChartCard } from "@/components/charts/chart-card";
import { CategoryBarChart, RevenueAreaChart } from "@/components/charts/charts";
import { StatCardsSkeleton, ChartSkeleton } from "@/components/shared/skeletons";
import { StatCard } from "@/components/shared/stat-card";
import { api } from "@/hooks/use-api";
import { revenueByMonth } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";
import type { Payment } from "@/types/api";

/** KPI tiles + charts computed from the caller's managed payments. */
export function EarningsOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["payments", "managed", "analytics"],
    queryFn: () => api.list<Payment>("/payments/managed", { limit: 100, sortBy: "createdAt", sortOrder: "desc" }),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <StatCardsSkeleton />
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const payments = data.data;
  const paid = payments.filter((p) => p.status === "PAID");
  const total = paid.reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").reduce((s, p) => s + p.amount, 0);
  const byProperty = new Map<string, number>();
  for (const p of paid) {
    const title = p.lease.room.unit.building.property?.title ?? "Unknown";
    byProperty.set(title, (byProperty.get(title) ?? 0) + p.amount);
  }
  const propertyData = [...byProperty.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label: label.length > 14 ? `${label.slice(0, 13)}…` : label, value }));
  const monthly = revenueByMonth(payments);
  const thisMonth = monthly[monthly.length - 1]?.value ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total collected" value={formatCurrency(total)} icon={CircleDollarSign} hint={`${paid.length} paid payments`} />
        <StatCard label="This month" value={formatCurrency(thisMonth)} icon={TrendingUp} tone="blue" />
        <StatCard label="In progress" value={formatCurrency(pending)} icon={Clock} hint="Awaiting Stripe confirmation" tone="amber" />
        <StatCard label="Average payment" value={formatCurrency(paid.length ? total / paid.length : 0)} icon={Banknote} tone="violet" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Monthly rent collected" description="Last 6 months">
          <RevenueAreaChart data={monthly} name="Rent collected" />
        </ChartCard>
        <ChartCard title="Collected by property" description="Top properties by paid rent">
          {propertyData.length ? (
            <CategoryBarChart data={propertyData} name="Collected (৳)" color="var(--chart-3)" />
          ) : (
            <p className="flex h-72 items-center justify-center text-sm text-muted-foreground">No paid rent yet.</p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
