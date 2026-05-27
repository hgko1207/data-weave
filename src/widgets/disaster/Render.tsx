"use client";

import type { DisasterData } from "./schema";

export function DisasterRender({ data }: { data: DisasterData }) {
  const latest = data.messages[0];
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-emerald-400">{data.total}</span>
        <span className="text-sm text-zinc-300">건</span>
        <span className="text-xs text-zinc-500">최근 {data.windowHours}시간 · {data.region}</span>
      </div>

      {latest ? (
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-2.5">
          <p className="text-xs font-medium text-zinc-300">{latest.disasterType}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{latest.message}</p>
        </div>
      ) : (
        <p className="text-sm text-zinc-400">최근 발송된 재난문자가 없어요.</p>
      )}

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}
