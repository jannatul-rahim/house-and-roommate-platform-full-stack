import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { RequestsTabs } from "@/components/dashboard/requests-tabs";

export const metadata: Metadata = { title: "Requests" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Requests" description="Approve or decline viewing requests and applications, then create leases for approved tenants." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <RequestsTabs />
      </Suspense>
    </div>
  );
}
