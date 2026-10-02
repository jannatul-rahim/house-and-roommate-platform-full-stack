import { SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RoommateFinder } from "@/components/roommates/roommate-finder";
import { PageHeader } from "@/components/shared/page-header";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Find roommates" };

export default function RoommatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Find roommates"
        description="Ranked by compatibility — see exactly why someone is a good fit."
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/roommate-profile">
              <SlidersHorizontal /> Edit my profile
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<CardGridSkeleton count={3} />}>
        <RoommateFinder />
      </Suspense>
    </div>
  );
}
