type Props = {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  valueClass?: string;
  sub?: string;
};

// 상세 페이지 상단 통계 요약 카드 (아파트/전월세/도서관 공용).
export function StatCard({ icon, label, value, accent, valueClass, sub }: Props) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-4">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className={`flex h-9 w-9 items-center justify-center rounded-md ${accent}`}
        >
          {icon}
        </span>
        <span className="text-sm font-medium text-zinc-300">{label}</span>
      </div>
      <p
        className={`mt-3 font-mono text-2xl font-semibold tracking-tight ${
          valueClass ?? "text-zinc-100"
        }`}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 font-mono text-xs text-zinc-400">{sub}</p> : null}
    </article>
  );
}
