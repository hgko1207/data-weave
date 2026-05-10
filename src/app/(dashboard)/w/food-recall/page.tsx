import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { WidgetPreview } from "@/components/widget/WidgetPreview";
import { SidePanelStub, UpcomingBanner } from "@/components/widget/WidgetDetailStub";
import type { WidgetConfig } from "@/widgets/_types";

export const dynamic = "force-dynamic";

const DEFAULT_CONFIG = {
  v: 1,
  allergyKeywords: [],
  windowHours: 168,
} satisfies WidgetConfig;

export default function FoodRecallDetailPage() {
  return (
    <PageFrame
      eyebrow="widget · food-recall"
      title="식품 리콜"
      description="식약처 회수·판매중지 정보. 키워드 검색, 기간 조절, 등급 필터, 페이지네이션."
      actions={
        <Link
          href="/settings"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
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
            "알레르기·키워드 다중 검색",
            "1~3등급 필터",
            "기간 조절 (24h ~ 30일)",
            "회사·제품명 정렬",
            "이미지 미리보기",
          ]}
        />
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            현재 미리보기 · 최근 7일 · 키워드 없음
          </p>
          <WidgetPreview widgetId="food-recall" config={DEFAULT_CONFIG} />
        </div>
      </div>
    </PageFrame>
  );
}
