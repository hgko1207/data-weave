import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { WidgetPreview } from "@/components/widget/WidgetPreview";
import { SidePanelStub, UpcomingBanner } from "@/components/widget/WidgetDetailStub";
import type { WidgetConfig } from "@/widgets/_types";

export const dynamic = "force-dynamic";

const DEFAULT_CONFIG = {
  v: 1,
  regionName: "대전",
  nx: 67,
  ny: 100,
  sidoName: "대전",
} satisfies WidgetConfig;

export default function WeatherDetailPage() {
  return (
    <PageFrame
      eyebrow="widget · weather"
      title="날씨"
      description="기상청 단기예보 + 에어코리아 미세먼지. 지역 검색·시간대별·주간 예보는 곧 추가됩니다."
      actions={
        <Link
          href="/settings"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          위젯 관리
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      }
    >
      <UpcomingBanner />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <SidePanelStub
          items={[
            "지역 검색 (광역·기초 + 위치 기반)",
            "시간대별 24시간 그래프",
            "주간 7일 예보",
            "강수·미세먼지 알림 임계값",
          ]}
        />
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            현재 미리보기 · 대전
          </p>
          <WidgetPreview widgetId="weather" config={DEFAULT_CONFIG} />
        </div>
      </div>
    </PageFrame>
  );
}
