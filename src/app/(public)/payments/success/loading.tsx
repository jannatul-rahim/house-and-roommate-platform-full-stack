import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-lg space-y-6 rounded-3xl border bg-card p-8">
        <Skeleton className="mx-auto size-16 rounded-2xl" />
        <Skeleton className="mx-auto h-8 w-56" />
        <Skeleton className="mx-auto h-4 w-72" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="mx-auto h-9 w-64" />
      </div>
    </div>
  );
}
