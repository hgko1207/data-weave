// 로또 당첨공 — 번호 구간별 색상 (동행복권 공식 색 체계).
export function LottoBall({
  num,
  size = "md",
}: {
  num: number;
  size?: "sm" | "md" | "lg";
}) {
  const palette =
    num <= 10
      ? "bg-yellow-500 text-yellow-950"
      : num <= 20
        ? "bg-blue-500 text-white"
        : num <= 30
          ? "bg-red-500 text-white"
          : num <= 40
            ? "bg-zinc-500 text-white"
            : "bg-emerald-500 text-emerald-950";
  const sizeCls =
    size === "sm"
      ? "h-7 w-7 text-xs"
      : size === "lg"
        ? "h-12 w-12 text-lg"
        : "h-9 w-9 text-sm";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-mono font-bold tabular-nums shadow-sm ${palette} ${sizeCls}`}
    >
      {num}
    </span>
  );
}
