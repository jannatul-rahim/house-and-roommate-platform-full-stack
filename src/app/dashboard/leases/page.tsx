import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { MyLeases } from "@/components/tenant/my-leases";

export const metadata: Metadata = { title: "My leases" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="My leases" description="Your rental agreements — pay rent securely with Stripe or report an issue." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <MyLeases />
      </Suspense>
    </div>
  );
}
