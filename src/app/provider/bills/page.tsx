import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { CreateBillButton, ManagedBills } from "@/components/provider/managed-bills";

export const metadata: Metadata = { title: "Utility bills" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Utility bills" description="Record utility bills for your properties and split them between tenants." actions={<CreateBillButton />} />
      <Suspense fallback={<DashboardListSkeleton />}>
        <ManagedBills />
      </Suspense>
    </div>
  );
}
