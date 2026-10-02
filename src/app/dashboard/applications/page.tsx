import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { MyApplications } from "@/components/tenant/my-applications";

export const metadata: Metadata = { title: "Applications" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Applications" description="Every rental application you've submitted and where it stands." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <MyApplications />
      </Suspense>
    </div>
  );
}
