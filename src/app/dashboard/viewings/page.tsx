import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { MyViewings } from "@/components/tenant/my-viewings";

export const metadata: Metadata = { title: "Viewing requests" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Viewing requests" description="Track the rooms you've asked to see and cancel requests you no longer need." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <MyViewings />
      </Suspense>
    </div>
  );
}
