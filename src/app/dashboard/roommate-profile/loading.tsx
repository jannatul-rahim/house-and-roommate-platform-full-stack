import { PageHeaderSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-[420px] w-full rounded-xl" />
    </div>
  );
}
