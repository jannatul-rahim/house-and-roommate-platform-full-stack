import { ArrowRight, Building2, CalendarCheck, FileSignature, Plus, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChartCard } from "@/components/charts/chart-card";
import { DonutChart, RevenueAreaChart } from "@/components/charts/charts";
import { PersonCell } from "@/components/dashboard/cells";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { countBy, revenueByMonth } from "@/lib/analytics";
import { loadAll, serverApi } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { PROPERTY_STATUSES, type Application, type Lease, type Payment, type Property, type ViewingRequest } from "@/types/api";

export const metadata: Metadata = { title: "Provider dashboard" };

export default async function ProviderOverviewPage() {
  const auth = { auth: true } as const;
  const [user, properties, viewings, applications, leases, payments] = await loadAll([
    () => getSession(),
    () => serverApi.list<Property>("/properties/my-properties", { ...auth, query: { limit: 100 } }),
    () => serverApi.list<ViewingRequest>("/viewing-requests/managed", { ...auth, query: { limit: 5, status: "PENDING", sortBy: "createdAt" } }),
    () => serverApi.list<Application>("/applications/managed", { ...auth, query: { limit: 5, status: "PENDING" } }),
    () => serverApi.list<Lease>("/leases/managed", { ...auth, query: { limit: 1, status: "ACTIVE" } }),
    () => serverApi.list<Payment>("/payments/managed", { ...auth, query: { limit: 100, status: "PAID" } }),
  ] as const);

  const revenue = payments.data.reduce((sum, p) => sum + p.amount, 0);
  const published = properties.data.filter((p) => p.status === "PUBLISHED").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0] ?? "there"}`}
        description="Your portfolio at a glance — requests waiting on you, leases and rent collected."
        actions={
          <Button asChild>
            <Link href="/provider/properties/new">
              <Plus /> Add property
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Properties" value={properties.meta.total} icon={Building2} hint={`${published} published`} />
        <StatCard label="Requests to review" value={viewings.meta.total + applications.meta.total} icon={CalendarCheck} hint={`${viewings.meta.total} viewings · ${applications.meta.total} applications`} tone="amber" />
        <StatCard label="Active leases" value={leases.meta.total} icon={FileSignature} tone="blue" />
        <StatCard label="Rent collected" value={formatCurrency(revenue)} icon={Wallet} hint={`${payments.meta.total} paid invoices`} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard title="Rent collected" description="Paid Stripe rent payments, last 6 months">
          <RevenueAreaChart data={revenueByMonth(payments.data)} name="Rent collected" />
        </ChartCard>
        <ChartCard title="Listing status" description="Your properties by publication state">
          <DonutChart data={countBy(properties.data, (p) => p.status, PROPERTY_STATUSES)} name="properties" />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading">Pending viewing requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/provider/requests">
                Review <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {viewings.data.length ? (
              <ul className="divide-y">
                {viewings.data.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0 space-y-1">
                      <PersonCell user={v.tenant} subtitle={`${formatDate(v.requestedDate)}${v.requestedTime ? ` · ${v.requestedTime}` : ""}`} />
                    </div>
                    <span className="truncate text-right text-xs text-muted-foreground">{v.property.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading">Pending applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/provider/requests?tab=applications">
                Review <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {applications.data.length ? (
              <ul className="divide-y">
                {applications.data.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                    <PersonCell user={a.tenant} subtitle={`Room ${a.room.roomNumber} · ${a.property.title}`} />
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No applications waiting.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {properties.meta.total === 0 && (
        <EmptyState
          icon={Building2}
          title="List your first property"
          description="Our guided wizard sets up the property, building, unit, first room and its availability in one go."
          action={
            <Button asChild>
              <Link href="/provider/properties/new">
                <Plus /> Start listing
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
