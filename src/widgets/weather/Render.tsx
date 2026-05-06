"use client";

import type { WeatherData } from "./schema";

const gradeColor: Record<WeatherData["pm10Grade"], string> = {
  "좋음": "text-emerald-400",
  "보통": "text-cyan-400",
  "나쁨": "text-amber-400",
  "매우 나쁨": "text-rose-400",
  "정보 없음": "text-zinc-500",
};

export function WeatherRender({ data }: { data: WeatherData }) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-zinc-100">
          {formatTemp(data.temp)}
        </span>
        <span className="text-sm text-zinc-400">
          {data.region} · {data.skyText}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span className="text-cyan-400">
          강수확률 <span className="font-mono">{data.pop}%</span>
        </span>
        <span className={gradeColor[data.pm10Grade]}>
          미세먼지{" "}
          <span className="font-mono">
            {data.pm10Value != null ? `${data.pm10Value}㎍` : "—"} · {data.pm10Grade}
          </span>
        </span>
        <span className={gradeColor[data.pm25Grade]}>
          초미세{" "}
          <span className="font-mono">
            {data.pm25Value != null ? `${data.pm25Value}㎍` : "—"} · {data.pm25Grade}
          </span>
        </span>
        {data.feelsLike != null ? (
          <span className="text-zinc-500">
            체감 <span className="font-mono">{formatTemp(data.feelsLike)}</span>
          </span>
        ) : null}
      </div>

      {data.hourly.length > 0 ? (
        <div className="overflow-x-auto snap-x">
          <ul className="flex gap-3 pb-1">
            {data.hourly.map((h) => (
              <li
                key={h.time}
                className="snap-start flex flex-col items-center gap-1 rounded-lg border border-white/5 bg-white/5 px-3 py-2 min-w-14"
              >
                <span className="font-mono text-[10px] text-zinc-500">{h.time}</span>
                <span className="font-mono text-sm text-zinc-200">{formatTemp(h.temp)}</span>
                <span className="font-mono text-[10px] text-cyan-400">{h.pop}%</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {data.source === "mock" ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function formatTemp(t: number): string {
  return `${t.toFixed(1)}°C`;
}
