import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { MyBills } from "@/components/tenant/my-bills";

export const metadata: Metadata = { title: "Utility bills" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Utility bills" description="Your share of electricity, gas, water and internet bills." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <MyBills />
      </Suspense>
    </div>
  );
}
