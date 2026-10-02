import { Building2, CalendarCheck, CreditCard, FileSignature, ScrollText, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChartCard } from "@/components/charts/chart-card";
import { CategoryBarChart, DonutChart, RevenueAreaChart } from "@/components/charts/charts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { countBy, revenueByMonth } from "@/lib/analytics";
import { loadAll, serverApi } from "@/lib/api/server";
import { formatCurrency, humanize } from "@/lib/format";
import {
  APPLICATION_STATUSES,
  MAINTENANCE_PRIORITIES,
  PROPERTY_TYPES,
  type Application,
  type Lease,
  type MaintenanceRequest,
  type Payment,
  type PublicProperty,
  type ViewingRequest,
} from "@/types/api";

export const metadata: Metadata = { title: "Admin analytics" };

export default async function AdminOverviewPage() {
  const auth = { auth: true } as const;
  // "managed" endpoints return every record for ADMIN, so they double as platform analytics.
  const [properties, payments, applications, leases, viewings, maintenance] = await loadAll([
    () => serverApi.list<PublicProperty>("/properties", { query: { limit: 100 }, revalidate: 60 }),
    () => serverApi.list<Payment>("/payments/managed", { ...auth, query: { limit: 100 } }),
    () => serverApi.list<Application>("/applications/managed", { ...auth, query: { limit: 100 } }),
    () => serverApi.list<Lease>("/leases/managed", { ...auth, query: { limit: 1, status: "ACTIVE" } }),
    () => serverApi.list<ViewingRequest>("/viewing-requests/managed", { ...auth, query: { limit: 1, status: "PENDING" } }),
    () => serverApi.list<MaintenanceRequest>("/maintenance-requests/managed", { ...auth, query: { limit: 100 } }),
  ] as const);

  const paid = payments.data.filter((p) => p.status === "PAID");
  const gmv = paid.reduce((s, p) => s + p.amount, 0);
  const openTickets = maintenance.data.filter((m) => m.status === "OPEN" || m.status === "IN_PROGRESS").length;

  const cityCounts = new Map<string, number>();
  for (const p of properties.data) cityCounts.set(p.city, (cityCounts.get(p.city) ?? 0) + 1);
  const byCity = [...cityCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }));
  const byType = countBy(properties.data, (p) => p.propertyType, PROPERTY_TYPES).filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform analytics"
        description="Live health of listings, bookings, rent and maintenance across NestMate."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/reports">
              <ScrollText /> Audit logs
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Published properties" value={properties.meta.total} icon={Building2} hint={`${properties.data.reduce((s, p) => s + p.availableRoomCount, 0)} rooms available`} />
        <StatCard label="Rent processed" value={formatCurrency(gmv)} icon={CreditCard} hint={`${paid.length} paid · ${payments.meta.total} total payments`} tone="violet" />
        <StatCard label="Active leases" value={leases.meta.total} icon={FileSignature} tone="blue" />
        <StatCard label="Pending viewings" value={viewings.meta.total} icon={CalendarCheck} tone="amber" />
        <StatCard label="Applications" value={applications.meta.total} icon={FileSignature} hint={`${applications.data.filter((a) => a.status === "PENDING").length} awaiting review`} />
        <StatCard label="Open maintenance" value={openTickets} icon={Wrench} hint={`${maintenance.meta.total} tickets in total`} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard title="Rent processed" description="Paid Stripe payments per month, last 6 months">
          <RevenueAreaChart data={revenueByMonth(payments.data)} name="Rent processed" />
        </ChartCard>
        <ChartCard title="Application pipeline" description="All applications by status">
          <DonutChart data={countBy(applications.data, (a) => a.status, APPLICATION_STATUSES).filter((d) => d.label !== humanize("UNDER_REVIEW"))} name="applications" />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Listings by city" description="Published properties" className="lg:col-span-2">
          {byCity.length ? <CategoryBarChart data={byCity} name="Properties" /> : <p className="py-16 text-center text-sm text-muted-foreground">No published listings yet.</p>}
        </ChartCard>
        <ChartCard title="Maintenance by priority" description="All tickets">
          <DonutChart data={countBy(maintenance.data, (m) => m.priority, MAINTENANCE_PRIORITIES)} name="tickets" />
        </ChartCard>
      </div>

      <ChartCard title="Listings by property type" description="Mix of published inventory">
        {byType.length ? <CategoryBarChart data={byType} name="Properties" color="var(--chart-3)" /> : <p className="py-16 text-center text-sm text-muted-foreground">No data yet.</p>}
      </ChartCard>
    </div>
  );
}
