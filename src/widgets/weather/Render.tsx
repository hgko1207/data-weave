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

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
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
          <span className="text-zinc-400">
            체감 <span className="font-mono">{formatTemp(data.feelsLike)}</span>
          </span>
        ) : null}
      </div>

      {data.hourly.length > 0 ? (
        <HourlyStrip hourly={data.hourly.slice(0, 6)} />
      ) : null}

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

export function HourlyStrip({
  hourly,
  showAll,
}: {
  hourly: WeatherData["hourly"];
  showAll?: boolean;
}) {
  const items = showAll ? hourly : hourly.slice(0, 6);
  const temps = items.map((h) => h.temp);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const range = Math.max(maxTemp - minTemp, 1);

  return (
    <div className="overflow-x-auto pb-1">
      <ul className="flex gap-2 min-w-min">
        {items.map((h) => {
          const ratio = (h.temp - minTemp) / range;
          return (
            <li
              key={h.time}
              className="flex shrink-0 flex-col items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-3 w-[76px]"
            >
              <span className="font-mono text-xs font-medium uppercase tracking-wider text-zinc-400">
                {h.time}
              </span>
              <span
                className="font-mono text-lg font-semibold tabular-nums"
                style={{
                  color:
                    ratio > 0.66
                      ? "rgb(252,165,165)"
                      : ratio < 0.33
                      ? "rgb(125,211,252)"
                      : "rgb(244,244,245)",
                }}
              >
                {Math.round(h.temp)}°
              </span>
              <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-cyan-400/80"
                  style={{ width: `${Math.min(h.pop, 100)}%` }}
                />
              </div>
              <span className="font-mono text-xs text-cyan-400 tabular-nums">{h.pop}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatTemp(t: number): string {
  return `${t.toFixed(1)}°C`;
}
