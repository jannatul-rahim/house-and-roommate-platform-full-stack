"use client";

import { CalendarCheck, FileSignature, FileText } from "lucide-react";
import { ManagedApplications } from "@/components/dashboard/managed-applications";
import { ManagedLeases } from "@/components/dashboard/managed-leases";
import { ManagedViewings } from "@/components/dashboard/managed-viewings";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryParams } from "@/hooks/use-query-params";

const TABS = ["viewings", "applications", "leases"] as const;

export function BookingsTabs() {
  const { get, setParams } = useQueryParams();
  const current = get("tab");
  const tab = TABS.includes(current as (typeof TABS)[number]) ? (current as (typeof TABS)[number]) : "viewings";

  return (
    <div className="space-y-5">
      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v === "viewings" ? null : v, status: null, sort: null })}>
        <TabsList>
          <TabsTrigger value="viewings">
            <CalendarCheck /> Viewings
          </TabsTrigger>
          <TabsTrigger value="applications">
            <FileText /> Applications
          </TabsTrigger>
          <TabsTrigger value="leases">
            <FileSignature /> Leases
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {tab === "viewings" && <ManagedViewings />}
      {tab === "applications" && <ManagedApplications />}
      {tab === "leases" && <ManagedLeases />}
    </div>
  );
}
