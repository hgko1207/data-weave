import { Sparkles } from "lucide-react";

export function UpcomingBanner({ note }: { note?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
      <p className="text-xs leading-relaxed text-zinc-300">
        <span className="font-medium text-zinc-100">상세 검색 페이지 작업 중입니다.</span>{" "}
        {note ?? "지금은 기본 설정으로 미리보기를 보여드립니다. 좌측은 곧 들어올 컨트롤 목록."}
      </p>
    </div>
  );
}

export function SidePanelStub({ items }: { items: string[] }) {
  return (
    <aside
      aria-label="추가 예정 컨트롤"
      className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-5"
    >
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        곧 추가
      </p>
      <ul className="mt-4 space-y-2.5">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2.5 text-sm text-zinc-400">
            <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
