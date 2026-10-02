import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page space-y-10 py-8">
      <Skeleton className="h-8 w-36" />
      <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2">
        <Skeleton className="aspect-[16/10] rounded-2xl md:col-span-2 md:row-span-2 md:aspect-auto md:h-96" />
        <Skeleton className="hidden aspect-[4/3] rounded-2xl md:block" />
        <Skeleton className="hidden aspect-[4/3] rounded-2xl md:block" />
        <Skeleton className="hidden rounded-2xl md:col-span-2 md:block" />
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
