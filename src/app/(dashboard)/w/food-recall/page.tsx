import { Construction } from "lucide-react";

export default function FoodRecallDetailPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          식품 리콜
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          식약처 회수·판매중지 정보. 키워드 검색, 기간 조절, 등급 필터, 페이지네이션.
        </p>
      </header>
      <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-8 text-center backdrop-blur">
        <Construction className="mx-auto h-6 w-6 text-amber-400" aria-hidden />
        <p className="mt-3 text-sm text-zinc-300">상세 검색 페이지 — Step C 작업 예정</p>
        <p className="mt-1 font-mono text-xs text-zinc-500">
          현재는 대시보드 카드 형태로 동일 데이터를 볼 수 있습니다.
        </p>
      </div>
    </section>
  );
}
