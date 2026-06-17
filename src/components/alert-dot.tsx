// 새 알림 표시 dot — 갯수 표시 없이 "있다"만. 정확한 건수는 위젯 페이지에서.
// 위젯 페이지 진입 시 자동으로 dot이 사라짐 (AlertCountsProvider의 markSeen).
export function AlertDot({ count }: { count?: number }) {
  if (!count || count === 0) return null;
  return (
    <span
      aria-label={`새 알림 ${count}건`}
      className="h-2 w-2 shrink-0 rounded-full bg-rose-500 shadow-[0_0_4px] shadow-rose-500/60 motion-safe:animate-pulse"
    />
  );
}
