import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { MaintenanceTable } from "@/components/dashboard/maintenance-table";

export const metadata: Metadata = { title: "Maintenance" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance" description="All maintenance tickets across properties, with the full resolution workflow." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <MaintenanceTable scope="managed" />
      </Suspense>
    </div>
  );
}
