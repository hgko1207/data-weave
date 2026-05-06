type Health = "healthy" | "warning" | "error";

const colors: Record<Health, string> = {
  healthy: "bg-emerald-400 shadow-emerald-400/50",
  warning: "bg-amber-400 shadow-amber-400/50",
  error: "bg-rose-400 shadow-rose-400/50",
};

const labels: Record<Health, string> = {
  healthy: "정상",
  warning: "경고",
  error: "오류",
};

export function WidgetHealthDot({ status }: { status: Health }) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={`위젯 상태: ${labels[status]}`}
      className={`relative inline-block h-2 w-2 rounded-full shadow-[0_0_8px] motion-safe:animate-pulse ${colors[status]}`}
    />
  );
}
