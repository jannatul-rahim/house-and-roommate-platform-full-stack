import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { TenantDirectory } from "@/components/admin/tenant-directory";

export const metadata: Metadata = { title: "Tenants" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tenants" description="Everyone renting or applying on NestMate, with their activity." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <TenantDirectory />
      </Suspense>
    </div>
  );
}
