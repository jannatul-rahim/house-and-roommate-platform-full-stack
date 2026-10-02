import { ArrowRight, CalendarCheck, CreditCard, FileSignature, FileText, Home, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PropertyRoomCell } from "@/components/dashboard/cells";
import { PayRentButton } from "@/components/dashboard/pay-rent-button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadAll, serverApi } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { formatCurrency, formatDate, formatRelative } from "@/lib/format";
import type { Application, Lease, MaintenanceRequest, Payment, ViewingRequest } from "@/types/api";

export const metadata: Metadata = { title: "My activity" };

export default async function TenantOverviewPage() {
  const opts = { auth: true } as const;
  const [user, viewings, pendingViewings, applications, pendingApps, leases, payments, maintenance] = await loadAll([
    () => getSession(),
    () => serverApi.list<ViewingRequest>("/viewing-requests/my-requests", { ...opts, query: { limit: 4 } }),
    () => serverApi.list<ViewingRequest>("/viewing-requests/my-requests", { ...opts, query: { limit: 1, status: "PENDING" } }),
    () => serverApi.list<Application>("/applications/my-applications", { ...opts, query: { limit: 4 } }),
    () => serverApi.list<Application>("/applications/my-applications", { ...opts, query: { limit: 1, status: "PENDING" } }),
    () => serverApi.list<Lease>("/leases/my-leases", { ...opts, query: { limit: 5, status: "ACTIVE" } }),
    () => serverApi.list<Payment>("/payments/my-payments", { ...opts, query: { limit: 100, status: "PAID" } }),
    () => serverApi.list<MaintenanceRequest>("/maintenance-requests/my-requests", { ...opts, query: { limit: 1, status: "OPEN" } }),
  ] as const);

  const totalPaid = payments.data.reduce((sum, p) => sum + p.amount, 0);
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hi ${firstName}, welcome back`}
        description="Here's everything happening with your rooms, requests and rent."
        actions={
          <Button asChild>
            <Link href="/properties">
              <Home /> Browse rooms
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending viewings" value={pendingViewings.meta.total} icon={CalendarCheck} hint={`${viewings.meta.total} requested in total`} tone="amber" />
        <StatCard label="Open applications" value={pendingApps.meta.total} icon={FileText} hint={`${applications.meta.total} submitted in total`} tone="blue" />
        <StatCard label="Active leases" value={leases.meta.total} icon={FileSignature} hint="Currently renting" />
        <StatCard label="Rent paid" value={formatCurrency(totalPaid)} icon={CreditCard} hint={`${payments.meta.total} successful payments`} tone="violet" />
      </div>

      {/* Active leases with one-click rent payment */}
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Your home</h2>
        {leases.data.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {leases.data.map((lease) => (
              <Card key={lease.id} className="gap-0 overflow-hidden py-0">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <PropertyRoomCell room={lease.room} />
                    <p className="text-xs text-muted-foreground">
                      {formatDate(lease.startDate)} – {lease.endDate ? formatDate(lease.endDate) : "open-ended"} · Rent {formatCurrency(lease.monthlyRent)}/mo
                    </p>
                  </div>
                  <PayRentButton leaseId={lease.id} amount={lease.monthlyRent} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileSignature}
            title="No active lease yet"
            description="Once an owner approves your application and creates a lease, it will appear here with a Pay rent button."
            action={
              <Button asChild variant="outline">
                <Link href="/properties">Find a room</Link>
              </Button>
            }
          />
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading">Recent viewing requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/viewings">
                View all <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {viewings.data.length ? (
              <ul className="divide-y">
                {viewings.data.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <PropertyRoomCell property={v.property} room={v.room} />
                      <p className="text-xs text-muted-foreground">
                        {formatDate(v.requestedDate)}
                        {v.requestedTime ? ` at ${v.requestedTime}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={v.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No viewing requests yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading">Recent applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/applications">
                View all <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {applications.data.length ? (
              <ul className="divide-y">
                {applications.data.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <PropertyRoomCell property={a.property} room={a.room} />
                      <p className="text-xs text-muted-foreground">Submitted {formatRelative(a.submittedAt)}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No applications yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {maintenance.meta.total > 0 && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center">
          <p className="flex items-center gap-2 text-sm">
            <Wrench className="size-4 text-amber-600" aria-hidden />
            You have <strong>{maintenance.meta.total}</strong> open maintenance request{maintenance.meta.total === 1 ? "" : "s"}.
          </p>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/maintenance">Track requests</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
