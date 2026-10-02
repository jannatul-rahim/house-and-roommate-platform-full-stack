import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { BookingsTabs } from "@/components/admin/bookings-tabs";

export const metadata: Metadata = { title: "Bookings" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Platform-wide viewing requests, applications and leases." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <BookingsTabs />
      </Suspense>
    </div>
  );
}
