import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { MaintenanceTable } from "@/components/dashboard/maintenance-table";

export const metadata: Metadata = { title: "Maintenance" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance" description="Move tenant-reported issues from open to in progress, resolved and closed." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <MaintenanceTable scope="managed" />
      </Suspense>
    </div>
  );
}
