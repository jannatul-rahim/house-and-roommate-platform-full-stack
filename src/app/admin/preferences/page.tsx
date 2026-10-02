import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { PreferenceManager } from "@/components/admin/preference-manager";

export const metadata: Metadata = { title: "Roommate preferences" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Roommate preferences" description="The catalogue tenants choose from when building roommate profiles." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <PreferenceManager />
      </Suspense>
    </div>
  );
}
