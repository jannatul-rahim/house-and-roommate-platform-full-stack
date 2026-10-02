import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { ManagedLeases } from "@/components/dashboard/managed-leases";

export const metadata: Metadata = { title: "Leases" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Leases" description="Every lease across your properties. Terminate active leases when a tenancy ends." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <ManagedLeases />
      </Suspense>
    </div>
  );
}
