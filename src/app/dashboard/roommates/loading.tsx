import { CardGridSkeleton, PageHeaderSkeleton, ToolbarSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <ToolbarSkeleton />
      <CardGridSkeleton count={3} />
    </div>
  );
}
