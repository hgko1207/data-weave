import { Skeleton } from "@/components/ui/skeleton";

export function WidgetSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}
