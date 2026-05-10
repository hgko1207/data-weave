import { Construction } from "lucide-react";

export default function WeatherDetailPage() {
  return (
    <DetailStub
      title="날씨"
      description="기상청 단기예보 + 에어코리아 미세먼지. 지역 검색 + 시간대별 + 주간 예보."
    />
  );
}

function DetailStub({ title, description }: { title: string; description: string }) {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{title}</h1>
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      </header>
      <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-8 text-center backdrop-blur">
        <Construction className="mx-auto h-6 w-6 text-amber-400" aria-hidden />
        <p className="mt-3 text-sm text-zinc-300">상세 검색 페이지 — Step B 작업 예정</p>
        <p className="mt-1 font-mono text-xs text-zinc-500">
          현재는 대시보드 카드 형태로 동일 데이터를 볼 수 있습니다.
        </p>
      </div>
    </section>
  );
}
