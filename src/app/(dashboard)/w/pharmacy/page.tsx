import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { WidgetPreview } from "@/components/widget/WidgetPreview";
import { SidePanelStub, UpcomingBanner } from "@/components/widget/WidgetDetailStub";
import type { WidgetConfig } from "@/widgets/_types";

export const dynamic = "force-dynamic";

const DEFAULT_CONFIG = {
  v: 1,
  sido: "대전광역시",
  sigungu: "유성구",
  lat: 36.3504,
  lng: 127.3845,
  radiusKm: 5,
} satisfies WidgetConfig;

export default function PharmacyDetailPage() {
  return (
    <PageFrame
      eyebrow="widget · pharmacy"
      title="SOS 병원·약국"
      description="야간·공휴일 운영 약국 + 응급실. 시·도/시·군·구 검색, 반경 조절, 지도 연결."
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
            "시·도 / 시·군·구 + 위치 기반 검색",
            "반경 1~20km 조절",
            "병원·약국 카카오맵 임베드",
            "오늘·공휴일 운영 필터",
            "전화 즉시 연결",
          ]}
        />
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            현재 미리보기 · 대전 유성구 5km
          </p>
          <WidgetPreview widgetId="pharmacy" config={DEFAULT_CONFIG} />
        </div>
      </div>
    </PageFrame>
  );
}
