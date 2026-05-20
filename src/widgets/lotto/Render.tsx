"use client";

import { LottoBall } from "@/components/widget/lotto/LottoBall";
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
