"use client";

import type { LibraryData } from "./schema";

export function LibraryRender({ data }: { data: LibraryData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-emerald-400">
          {data.total}
        </span>
        <span className="text-sm text-zinc-300">곳</span>
        <span className="text-xs text-zinc-500">{data.region}</span>
      </div>

      <ul className="divide-y divide-white/5">
        {data.libraries.slice(0, 4).map((lib) => (
          <li key={lib.id} className="py-2">
            <p className="text-sm font-medium text-zinc-100">{lib.name}</p>
            <p className="truncate text-xs text-zinc-500">{lib.address}</p>
          </li>
        ))}
      </ul>

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}
