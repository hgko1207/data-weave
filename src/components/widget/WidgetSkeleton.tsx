import { Skeleton } from "@/components/ui/skeleton";

export function WidgetSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}
