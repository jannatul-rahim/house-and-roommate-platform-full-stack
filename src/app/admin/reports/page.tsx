import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { AuditLogs } from "@/components/admin/audit-logs";

export const metadata: Metadata = { title: "Audit logs" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Audit logs" description="Immutable record of sensitive actions — who did what, and when." />
      <Suspense fallback={<DashboardListSkeleton />}>
        <AuditLogs />
      </Suspense>
    </div>
  );
}
