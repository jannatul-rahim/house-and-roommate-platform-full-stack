"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { api, useApiAction } from "@/hooks/use-api";
import type { Property } from "@/types/api";

/** Owner "availability": take whole listings on or off the market in one switch. */
export function ListingAvailability() {
  const { data, isLoading } = useQuery({ queryKey: ["properties", "mine", "availability"], queryFn: () => api.list<Property>("/properties/my-properties", { limit: 100, sortBy: "title", sortOrder: "asc" }) });
  const toggle = useApiAction(({ id, live }: { id: string; live: boolean }) => api.patch(`/properties/${id}`, { status: live ? "PUBLISHED" : "UNPUBLISHED" }), {
    success: "Listing availability updated",
    invalidate: [["properties"]],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Listing availability</CardTitle>
        <CardDescription>Switch a property off to pause new viewings and applications. Room-level dates are set on each property&apos;s manage page.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : data?.data.length ? (
          <ul className="divide-y">
            {data.data.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link href={`/provider/properties/${p.id}`} className="line-clamp-1 font-medium hover:text-primary">
                    {p.title}
                  </Link>
                  <StatusBadge status={p.status} className="mt-1" />
                </div>
                <Switch
                  checked={p.status === "PUBLISHED"}
                  disabled={toggle.isPending || p.status === "ARCHIVED"}
                  onCheckedChange={(live) => toggle.mutate({ id: p.id, live })}
                  aria-label={`Accept bookings for ${p.title}`}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">You haven&apos;t listed any properties yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
