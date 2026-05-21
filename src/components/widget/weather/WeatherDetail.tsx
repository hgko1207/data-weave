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
import { getSkyVisual } from "./sky-icon";

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
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function CurrentCard({ data }: { data: WeatherData }) {
  const sky = getSkyVisual(data.skyText);
  const SkyIcon = sky.Icon;
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <CloudSun className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
              현재 날씨
            </p>
            <p className="text-sm font-medium text-zinc-100">{data.region}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <SkyIcon className={`h-4 w-4 ${sky.color}`} aria-hidden />
          <p className="text-sm text-zinc-300">{data.skyText}</p>
        </div>
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

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3.5 text-sm">
        <DetailRow
          icon={<Droplets className="h-4 w-4 text-cyan-400" aria-hidden />}
          label="강수확률"
          value={`${data.pop}%`}
        />
        <DetailRow
          icon={<ThermometerSun className="h-4 w-4 text-amber-400" aria-hidden />}
          label="체감"
          value={data.feelsLike != null ? `${data.feelsLike.toFixed(1)}°C` : "—"}
        />
        <DetailRow
          icon={<Gauge className="h-4 w-4 text-cyan-300" aria-hidden />}
          label="습도"
          value={data.humidity != null ? `${data.humidity}%` : "—"}
        />
        <DetailRow
          icon={<Compass className="h-4 w-4 text-zinc-300" aria-hidden />}
          label="바람"
          value={
            data.windSpeed != null
              ? `${data.windDirectionLabel ?? ""} ${data.windSpeed.toFixed(1)}m/s`.trim()
              : "—"
          }
        />
        {data.precipitation != null && data.precipitation > 0 ? (
          <DetailRow
            icon={<CloudRain className="h-4 w-4 text-cyan-400" aria-hidden />}
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
      <dt className="text-zinc-400">{label}</dt>
      <dd className="ml-auto font-mono text-base font-medium text-zinc-100">{value}</dd>
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
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
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
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <dt className="text-sm text-zinc-400">{label}</dt>
        <dd className={`text-sm font-medium ${gradeColor[grade]}`}>{grade}</dd>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-semibold text-zinc-100">
          {value ?? "—"}
        </span>
        <span className="font-mono text-sm text-zinc-500">{unit}</span>
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
        <h2 className="text-base font-semibold text-zinc-100">시간대별 예보</h2>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
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

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-zinc-100">주간 예보</h2>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
          {daily.length}일 · 단기 + 중기
        </p>
      </header>
      <ul className="mt-2">
        {daily.map((d) => (
          <DailyRow key={d.dayOffset} day={d} />
        ))}
      </ul>
    </article>
  );
}

function DailyRow({ day }: { day: DailyPoint }) {
  const sky = getSkyVisual(day.skyText);
  const Icon = sky.Icon;
  const isWeekend = day.label === "토요일" || day.label === "일요일";
  const popLevel = (day.pop ?? 0) > 30 ? "high" : (day.pop ?? 0) > 0 ? "low" : "none";

  return (
    <li className="grid grid-cols-[80px_36px_1fr_88px_auto] items-center gap-4 border-t border-zinc-800/60 py-4 first:border-t-0">
      <span
        className={`text-base font-medium ${isWeekend ? "text-rose-300" : "text-zinc-100"}`}
      >
        {day.label}
      </span>

      <Icon className={`h-6 w-6 shrink-0 ${sky.color}`} aria-hidden />

      <span className="truncate text-sm text-zinc-400">{day.skyText}</span>

      <div className="flex items-center gap-1.5">
        {popLevel === "none" ? (
          <span className="font-mono text-sm text-zinc-700">—</span>
        ) : (
          <>
            <Droplets
              className={`h-4 w-4 ${popLevel === "high" ? "text-cyan-400" : "text-cyan-400/60"}`}
              aria-hidden
            />
            <span
              className={`font-mono text-sm tabular-nums ${
                popLevel === "high" ? "text-cyan-400" : "text-cyan-400/70"
              }`}
            >
              {day.pop}%
            </span>
          </>
        )}
      </div>

      <div className="flex items-baseline gap-2.5 font-mono tabular-nums">
        <span className="w-10 text-right text-base font-semibold text-cyan-300">
          {day.low != null ? `${Math.round(day.low)}°` : "—"}
        </span>
        <span aria-hidden className="text-zinc-600">/</span>
        <span className="w-10 text-base font-semibold text-rose-300">
          {day.high != null ? `${Math.round(day.high)}°` : "—"}
        </span>
      </div>
    </li>
  );
}
