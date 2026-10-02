import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { MaintenanceForm } from "@/components/dashboard/maintenance-form";
import { MaintenanceTable } from "@/components/dashboard/maintenance-table";

export const metadata: Metadata = { title: "Maintenance" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance" description="Report problems in your room and follow them until they're fixed." actions={<MaintenanceForm />} />
      <Suspense fallback={<DashboardListSkeleton />}>
        <MaintenanceTable scope="mine" />
      </Suspense>
    </div>
  );
}
