import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { PaymentsTable } from "@/components/dashboard/payments-table";

export const metadata: Metadata = { title: "Payments" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Your complete rent payment history." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <PaymentsTable scope="mine" />
      </Suspense>
    </div>
  );
}
