"use client";

import type { LottoData } from "./schema";

export function LottoRender({ data }: { data: LottoData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-emerald-400">
          {data.round}
        </span>
        <span className="text-sm text-zinc-300">회</span>
        <span className="font-mono text-xs text-zinc-500">{data.drawDate}</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {data.numbers.map((n) => (
          <LottoBall key={n} num={n} size="sm" />
        ))}
        <span className="font-mono text-xs text-zinc-500">+</span>
        <LottoBall num={data.bonus} size="sm" />
      </div>

      {data.source === "mock" ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          mock · API 연동 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function LottoBall({ num, size }: { num: number; size: "sm" | "md" }) {
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
  const sizeCls = size === "sm" ? "h-7 w-7 text-xs" : "h-10 w-10 text-base";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-mono font-bold tabular-nums ${palette} ${sizeCls}`}
    >
      {num}
    </span>
  );
}
