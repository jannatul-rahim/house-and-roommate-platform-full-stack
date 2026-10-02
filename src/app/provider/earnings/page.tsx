import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentsTable } from "@/components/dashboard/payments-table";
import { EarningsOverview } from "@/components/provider/earnings-overview";
import { PageHeader } from "@/components/shared/page-header";
import { TableSkeleton } from "@/components/shared/skeletons";

export const metadata: Metadata = { title: "Earnings" };

export default function EarningsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Earnings" description="Rent collected through Stripe across all of your properties." />
      <EarningsOverview />
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">Payment history</h2>
        <Suspense fallback={<TableSkeleton />}>
          <PaymentsTable scope="managed" />
        </Suspense>
      </section>
    </div>
  );
}
