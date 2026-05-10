import { Construction, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageFrame } from "@/components/page-frame";

export default function PharmacyDetailPage() {
  return (
    <PageFrame
      eyebrow="widget · pharmacy"
      title="SOS 병원·약국"
      description="야간·공휴일 운영 약국 + 응급실. 시·도 / 시·군·구 검색, 반경 조절, 지도 연결."
    >
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-8 backdrop-blur">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
            <Construction className="h-5 w-5 text-amber-400" aria-hidden />
          </div>
          <h2 className="mt-4 text-base font-medium text-zinc-100">상세 검색 페이지 — Step C 작업 예정</h2>
          <p className="mt-1.5 text-sm text-zinc-400">
            현재는 대시보드 카드 형태로 동일 데이터를 보실 수 있습니다.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-zinc-300 transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            대시보드로 가기
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>
    </PageFrame>
  );
}
