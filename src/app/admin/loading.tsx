import { ChartSkeleton, PageHeaderSkeleton, StatCardsSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={6} />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartSkeleton className="lg:col-span-2" />
        <ChartSkeleton />
      </div>
    </div>
  );
}
