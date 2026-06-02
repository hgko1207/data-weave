import { Skeleton } from "@/components/ui/skeleton";
import { PageFrame } from "@/components/page-frame";
import { WIDGET_META } from "@/widgets/_metadata";

// 위젯 상세 페이지 진입 시 RSC fetch 완료 전 표시할 스켈레톤.
// PageFrame의 골격(eyebrow + title + description) + 검색 패널 자리 + 결과 자리.
//
// widgetId를 받으면 실제 위젯 메타로 헤더를 채워서 페이지 전환이 자연스러움.
// (검색 조건은 client filter라 client 측에선 그대로 살아 있지만, 서버 RSC fetch가
//  돌고 있는 동안 그 위 영역만 잠깐 비는 효과.)
type Props = {
  widgetId?: string;
};

export function WidgetPageLoading({ widgetId }: Props) {
  const meta = widgetId ? WIDGET_META.find((w) => w.id === widgetId) : undefined;

  return (
    <PageFrame
      eyebrow={meta ? `widget · ${meta.id}` : "widget"}
      title={meta?.title ?? "불러오는 중..."}
      description={meta?.description}
    >
      <section className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-5">
        <Skeleton className="h-3 w-20" />
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-900 p-4"
          >
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}
