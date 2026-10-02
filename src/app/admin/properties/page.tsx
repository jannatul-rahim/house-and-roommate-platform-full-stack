import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { AdminProperties } from "@/components/admin/admin-properties";

export const metadata: Metadata = { title: "Properties" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Properties" description="Moderate every published listing — unpublish, archive or remove." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <AdminProperties />
      </Suspense>
    </div>
  );
}
