import {
  CloudSun,
  Droplets,
  Wind,
  ThermometerSun,
  ArrowDown,
  ArrowUp,
  Gauge,
  CloudRain,
  Compass,
} from "lucide-react";
import { HourlyStrip } from "@/widgets/weather/Render";
import type { DailyPoint, WeatherData } from "@/widgets/weather/schema";

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

      <DailyForecastCard daily={data.daily} />

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
        {data.todayHigh != null && data.todayLow != null ? (
          <div className="ml-auto flex flex-col items-end gap-0.5 font-mono text-xs">
            <span className="flex items-center gap-1 text-rose-300">
              <ArrowUp className="h-3 w-3" aria-hidden />
              {Math.round(data.todayHigh)}°
            </span>
            <span className="flex items-center gap-1 text-cyan-300">
              <ArrowDown className="h-3 w-3" aria-hidden />
              {Math.round(data.todayLow)}°
            </span>
          </div>
        ) : null}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <DetailRow
          icon={<Droplets className="h-3.5 w-3.5 text-cyan-400" aria-hidden />}
          label="강수확률"
          value={`${data.pop}%`}
        />
        <DetailRow
          icon={<ThermometerSun className="h-3.5 w-3.5 text-amber-400" aria-hidden />}
          label="체감"
          value={data.feelsLike != null ? `${data.feelsLike.toFixed(1)}°C` : "—"}
        />
        <DetailRow
          icon={<Gauge className="h-3.5 w-3.5 text-cyan-300" aria-hidden />}
          label="습도"
          value={data.humidity != null ? `${data.humidity}%` : "—"}
        />
        <DetailRow
          icon={<Compass className="h-3.5 w-3.5 text-zinc-300" aria-hidden />}
          label="바람"
          value={
            data.windSpeed != null
              ? `${data.windDirectionLabel ?? ""} ${data.windSpeed.toFixed(1)}m/s`.trim()
              : "—"
          }
        />
        {data.precipitation != null && data.precipitation > 0 ? (
          <DetailRow
            icon={<CloudRain className="h-3.5 w-3.5 text-cyan-400" aria-hidden />}
            label="강수량"
            value={`${data.precipitation.toFixed(1)}mm/h`}
          />
        ) : null}
      </dl>
    </article>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <dt className="text-zinc-500">{label}</dt>
      <dd className="ml-auto font-mono text-zinc-100">{value}</dd>
    </div>
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

function DailyForecastCard({ daily }: { daily: DailyPoint[] }) {
  if (daily.length === 0) return null;

  const tempBounds = daily.reduce(
    (acc, d) => {
      if (d.high != null && d.high > acc.max) acc.max = d.high;
      if (d.low != null && d.low < acc.min) acc.min = d.low;
      return acc;
    },
    { min: Infinity, max: -Infinity },
  );
  const range = Math.max(tempBounds.max - tempBounds.min, 1);

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-zinc-100">주간 예보</h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {daily.length}일 · 단기 + 중기예보
        </p>
      </header>
      <ul className="mt-4 divide-y divide-zinc-800/60">
        {daily.map((d) => (
          <DailyRow key={d.dayOffset} day={d} bounds={tempBounds} range={range} />
        ))}
      </ul>
    </article>
  );
}

function DailyRow({
  day,
  bounds,
  range,
}: {
  day: DailyPoint;
  bounds: { min: number; max: number };
  range: number;
}) {
  const lowPct =
    day.low != null ? ((day.low - bounds.min) / range) * 100 : 0;
  const highPct =
    day.high != null ? ((day.high - bounds.min) / range) * 100 : 100;
  const widthPct = Math.max(highPct - lowPct, 4);

  return (
    <li className="grid grid-cols-[minmax(0,4rem)_minmax(0,5rem)_1fr_auto] items-center gap-3 py-3">
      <span className="text-sm font-medium text-zinc-100">{day.label}</span>
      <span className="text-xs text-zinc-500">{day.skyText}</span>
      <div className="relative h-1.5 rounded-full bg-zinc-800">
        {day.low != null && day.high != null ? (
          <span
            aria-hidden
            className="absolute inset-y-0 rounded-full bg-gradient-to-r from-cyan-400/80 via-emerald-400/80 to-rose-400/80"
            style={{
              left: `${lowPct}%`,
              width: `${widthPct}%`,
            }}
          />
        ) : null}
      </div>
      <span className="font-mono text-xs tabular-nums text-zinc-400">
        <span className="text-cyan-300">{day.low != null ? `${Math.round(day.low)}°` : "—"}</span>
        <span className="text-zinc-600"> · </span>
        <span className="text-rose-300">{day.high != null ? `${Math.round(day.high)}°` : "—"}</span>
        {day.pop != null && day.pop > 0 ? (
          <span className="ml-2 text-cyan-400">{day.pop}%</span>
        ) : null}
      </span>
    </li>
  );
}
