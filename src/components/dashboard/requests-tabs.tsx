"use client";

import { CalendarCheck, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryParams } from "@/hooks/use-query-params";
import { ManagedApplications } from "./managed-applications";
import { ManagedViewings } from "./managed-viewings";

/** Viewings / applications switcher; the active tab lives in `?tab=`. */
export function RequestsTabs() {
  const { get, setParams } = useQueryParams();
  const tab = get("tab") === "applications" ? "applications" : "viewings";

  return (
    <div className="space-y-5">
      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v === "viewings" ? null : v, status: null, sort: null })}>
        <TabsList>
          <TabsTrigger value="viewings">
            <CalendarCheck /> Viewing requests
          </TabsTrigger>
          <TabsTrigger value="applications">
            <FileText /> Applications
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {tab === "viewings" ? <ManagedViewings /> : <ManagedApplications />}
    </div>
  );
}
