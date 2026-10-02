import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MyProperties } from "@/components/provider/my-properties";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardListSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "My properties" };

export default function ProviderPropertiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My properties"
        description="Publish, pause or archive listings and manage their buildings, units and rooms."
        actions={
          <Button asChild>
            <Link href="/provider/properties/new">
              <Plus /> Add property
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<DashboardListSkeleton />}>
        <MyProperties />
      </Suspense>
    </div>
  );
}
