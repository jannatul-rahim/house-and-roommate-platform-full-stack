import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-6 w-56" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}
