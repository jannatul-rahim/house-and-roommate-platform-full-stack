import { CardGridSkeleton, ToolbarSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page space-y-8 py-10">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-4 w-64" />
      </div>
      <ToolbarSkeleton />
      <CardGridSkeleton count={9} />
    </div>
  );
}
