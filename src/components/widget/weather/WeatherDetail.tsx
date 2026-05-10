import { CloudSun, Droplets, Wind, ThermometerSun } from "lucide-react";
import { HourlyStrip } from "@/widgets/weather/Render";
import type { WeatherData } from "@/widgets/weather/schema";

const gradeColor: Record<WeatherData["pm10Grade"], string> = {
  "좋음": "text-emerald-400",
  "보통": "text-cyan-400",
  "나쁨": "text-amber-400",
  "매우 나쁨": "text-rose-400",
  "정보 없음": "text-zinc-500",
};

export function WeatherDetail({ data }: { data: WeatherData }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <CurrentCard data={data} />
        <AirQualityCard data={data} />
      </div>

      <HourlyChartCard data={data} />

      {data.source === "mock" ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function CurrentCard({ data }: { data: WeatherData }) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <CloudSun className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              현재 날씨
            </p>
            <p className="text-sm font-medium text-zinc-100">{data.region}</p>
          </div>
        </div>
        <p className="text-xs text-zinc-500">{data.skyText}</p>
      </header>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="font-mono text-6xl font-bold tracking-tight text-zinc-100">
          {data.temp.toFixed(1)}
        </span>
        <span className="font-mono text-2xl text-zinc-400">°C</span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div className="flex items-center gap-2">
          <Droplets className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
          <dt className="text-zinc-500">강수확률</dt>
          <dd className="ml-auto font-mono text-zinc-100">{data.pop}%</dd>
        </div>
        <div className="flex items-center gap-2">
          <ThermometerSun className="h-3.5 w-3.5 text-amber-400" aria-hidden />
          <dt className="text-zinc-500">체감</dt>
          <dd className="ml-auto font-mono text-zinc-100">
            {data.feelsLike != null ? `${data.feelsLike.toFixed(1)}°C` : "—"}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function AirQualityCard({ data }: { data: WeatherData }) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-400">
          <Wind className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            대기질
          </p>
          <p className="text-sm font-medium text-zinc-100">에어코리아</p>
        </div>
      </header>

      <dl className="mt-5 space-y-4">
        <AirQualityRow
          label="미세먼지 (PM10)"
          value={data.pm10Value}
          unit="㎍/㎥"
          grade={data.pm10Grade}
        />
        <AirQualityRow
          label="초미세먼지 (PM2.5)"
          value={data.pm25Value}
          unit="㎍/㎥"
          grade={data.pm25Grade}
        />
      </dl>
    </article>
  );
}

function AirQualityRow({
  label,
  value,
  unit,
  grade,
}: {
  label: string;
  value: number | null;
  unit: string;
  grade: WeatherData["pm10Grade"];
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <dt className="text-xs text-zinc-500">{label}</dt>
        <dd className={`text-xs font-medium ${gradeColor[grade]}`}>{grade}</dd>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-xl font-semibold text-zinc-100">
          {value ?? "—"}
        </span>
        <span className="font-mono text-xs text-zinc-500">{unit}</span>
      </div>
    </div>
  );
}

function HourlyChartCard({ data }: { data: WeatherData }) {
  if (data.hourly.length === 0) {
    return (
      <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
        <p className="text-sm text-zinc-500">시간대별 예보 없음</p>
      </article>
    );
  }
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-zinc-100">시간대별 예보</h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          최대 {data.hourly.length}시간
        </p>
      </header>
      <div className="mt-4">
        <HourlyStrip hourly={data.hourly} showAll />
      </div>
    </article>
  );
}
