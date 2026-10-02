"use client";

import { useQuery } from "@tanstack/react-query";
import { HeartHandshake, SlidersHorizontal, Users } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SearchInput } from "@/components/shared/search-input";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, useListQuery } from "@/hooks/use-api";
import { parseSort, useQueryParams } from "@/hooks/use-query-params";
import { ApiError } from "@/lib/api/errors";
import type { RoommateMatch, RoommateProfile } from "@/types/api";
import { RoommateCard } from "./roommate-card";

const YES_NO = [
  { value: "false", label: "No" },
  { value: "true", label: "Yes" },
];

const SORTS = [
  { value: "createdAt:desc", label: "Newest profiles" },
  { value: "budgetMax:desc", label: "Highest budget" },
  { value: "budgetMin:asc", label: "Lowest budget" },
  { value: "moveInDate:asc", label: "Moving in soonest" },
];

function useHasProfile() {
  return useQuery({
    queryKey: ["roommate-profile", "me"],
    queryFn: async () => {
      try {
        return await api.get<RoommateProfile>("/roommate-profile/me");
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
}

export function RoommateFinder() {
  const { get, setParams, page } = useQueryParams();
  const tab = get("tab") === "discover" ? "discover" : "matches";
  const profile = useHasProfile();

  const filters = {
    page,
    limit: 9,
    search: get("search"),
    location: get("location"),
    smoking: get("smoking"),
    pets: get("pets"),
  };
  const matches = useListQuery<RoommateMatch>(["roommates", "matches"], "/roommates/matches", filters, tab === "matches" && !!profile.data);
  const discover = useListQuery<RoommateProfile>(
    ["roommates", "discover"],
    "/roommates",
    { ...filters, ...parseSort(get("sort"), "createdAt:desc") },
    tab === "discover",
  );

  const noProfile = profile.isSuccess && !profile.data;

  return (
    <div className="space-y-5">
      {noProfile && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <HeartHandshake className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <p className="font-semibold">Create your roommate profile to unlock matches</p>
              <p className="text-sm text-muted-foreground">We score compatibility on budget, location, move-in date, lifestyle and shared preferences.</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/roommate-profile">Create profile</Link>
          </Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={(value) => setParams({ tab: value === "matches" ? null : value, sort: null })}>
        <TabsList>
          <TabsTrigger value="matches">
            <HeartHandshake /> Best matches
          </TabsTrigger>
          <TabsTrigger value="discover">
            <Users /> Discover all
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ListToolbar>
        <SearchInput placeholder="Search bio, job or area" />
        <SearchInput placeholder="Location" paramKey="location" className="sm:max-w-44" />
        <FilterSelect paramKey="smoking" options={YES_NO} placeholder="Smoker?" allLabel="Smoking: any" />
        <FilterSelect paramKey="pets" options={YES_NO} placeholder="Pets?" allLabel="Pets: any" />
        {tab === "discover" && <FilterSelect paramKey="sort" options={SORTS} placeholder="Sort" defaultValue="createdAt:desc" />}
      </ListToolbar>

      {tab === "matches" ? (
        noProfile ? null : matches.isLoading || profile.isLoading ? (
          <CardGridSkeleton count={3} />
        ) : matches.data?.data.length ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {matches.data.data.map((m) => (
                <RoommateCard key={m.profile.id} profile={m.profile} match={m} />
              ))}
            </div>
            <PaginationControls meta={matches.data.meta} itemLabel="matches" />
          </>
        ) : (
          <EmptyState icon={SlidersHorizontal} title="No matches yet" description="Try loosening your filters, or check back as more tenants join." />
        )
      ) : discover.isLoading ? (
        <CardGridSkeleton count={6} />
      ) : discover.data?.data.length ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {discover.data.data.map((p) => (
              <RoommateCard key={p.id} profile={p} />
            ))}
          </div>
          <PaginationControls meta={discover.data.meta} itemLabel="profiles" />
        </>
      ) : (
        <EmptyState icon={Users} title="No roommate profiles found" description="Nobody matches these filters right now." />
      )}
    </div>
  );
}
