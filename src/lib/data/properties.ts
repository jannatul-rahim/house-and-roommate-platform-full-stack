import "server-only";
import { serverApi } from "@/lib/api/server";
import type { PublicProperty } from "@/types/api";

/** Market snapshot for marketing pages, computed from live listings. */
export async function getMarketSnapshot() {
  const { data, meta } = await serverApi.list<PublicProperty>("/properties", {
    query: { limit: 100, sortBy: "createdAt", sortOrder: "desc" },
    revalidate: 120,
  });

  const rents = data.map((p) => p.minMonthlyRent).filter((r): r is number => r !== null);
  const cityCounts = new Map<string, number>();
  for (const p of data) cityCounts.set(p.city, (cityCounts.get(p.city) ?? 0) + 1);

  return {
    properties: data,
    totalProperties: meta.total,
    availableRooms: data.reduce((sum, p) => sum + p.availableRoomCount, 0),
    cities: [...cityCounts.entries()].sort((a, b) => b[1] - a[1]).map(([city, count]) => ({ city, count })),
    lowestRent: rents.length ? Math.min(...rents) : null,
  };
}

export type MarketSnapshot = Awaited<ReturnType<typeof getMarketSnapshot>>;
