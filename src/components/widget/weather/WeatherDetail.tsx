import {
  CloudSun,
  Droplets,
  Wind,
  ThermometerSun,
  ArrowDown,
  ArrowUp,
  Gauge,
  CloudRain,
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

      <DailyForecastCard daily={data.daily} currentTemp={data.temp} />

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

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3.5 text-sm">
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
          {data.precipitation != null && data.precipitation > 0 ? (
            <DetailRow
              icon={<CloudRain className="h-4 w-4 text-cyan-400" aria-hidden />}
              label="강수량"
              value={`${data.precipitation.toFixed(1)}mm/h`}
            />
          ) : null}
        </dl>
        {data.windSpeed != null ? (
          <WindCompass
            deg={data.windDirection}
            label={data.windDirectionLabel}
            speed={data.windSpeed}
          />
        ) : null}
      </div>
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

function DailyForecastCard({
  daily,
  currentTemp,
}: {
  daily: DailyPoint[];
  currentTemp: number;
}) {
  if (daily.length === 0) return null;

  // 주간 전체 기온 범위 — 레인지 바 트랙의 양 끝 기준
  const lows = daily.map((d) => d.low).filter((v): v is number => v != null);
  const highs = daily.map((d) => d.high).filter((v): v is number => v != null);
  const weekMin = lows.length > 0 ? Math.min(...lows) : 0;
  const weekMax = highs.length > 0 ? Math.max(...highs) : 1;

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
          <DailyRow
            key={d.dayOffset}
            day={d}
            weekMin={weekMin}
            weekMax={weekMax}
            currentTemp={d.dayOffset === 0 ? currentTemp : null}
          />
        ))}
      </ul>
    </article>
  );
}

function DailyRow({
  day,
  weekMin,
  weekMax,
  currentTemp,
}: {
  day: DailyPoint;
  weekMin: number;
  weekMax: number;
  currentTemp: number | null;
}) {
  const sky = getSkyVisual(day.skyText);
  const Icon = sky.Icon;
  const isWeekend = day.label === "토요일" || day.label === "일요일";
  const pop = day.pop ?? 0;

  return (
    <li className="grid grid-cols-[2.75rem_1.5rem_2.25rem_1.75rem_1fr_1.75rem] items-center gap-2.5 border-t border-zinc-800/60 py-3.5 first:border-t-0 sm:gap-3.5">
      <span
        className={`text-sm font-medium ${isWeekend ? "text-rose-300" : "text-zinc-100"}`}
      >
        {day.label.replace("요일", "")}
      </span>

      <span className="flex items-center">
        <Icon className={`h-5 w-5 shrink-0 ${sky.color}`} aria-hidden />
        <span className="sr-only">{day.skyText}</span>
      </span>

      <span className="text-right font-mono text-xs tabular-nums text-cyan-400">
        {pop > 0 ? `${day.pop}%` : ""}
      </span>

      <span className="text-right font-mono text-sm tabular-nums text-cyan-300">
        {day.low != null ? `${Math.round(day.low)}°` : "—"}
      </span>

      <TempRangeBar
        low={day.low}
        high={day.high}
        weekMin={weekMin}
        weekMax={weekMax}
        currentTemp={currentTemp}
      />

      <span className="font-mono text-sm tabular-nums text-rose-300">
        {day.high != null ? `${Math.round(day.high)}°` : "—"}
      </span>
    </li>
  );
}

// 그날 최저~최고 구간을 주간 전체 범위(weekMin~weekMax) 위에 막대로.
// 막대 색은 양 끝 절대기온으로 cold(cyan)→hot(rose) 매핑. 오늘 행은 현재기온 점 표시.
function TempRangeBar({
  low,
  high,
  weekMin,
  weekMax,
  currentTemp,
}: {
  low: number | null;
  high: number | null;
  weekMin: number;
  weekMax: number;
  currentTemp: number | null;
}) {
  const track = "relative h-1.5 w-full rounded-full bg-zinc-800";
  if (low == null || high == null) {
    return <div className={track} aria-hidden />;
  }
  const span = weekMax - weekMin || 1;
  const leftPct = ((low - weekMin) / span) * 100;
  const widthPct = Math.max(((high - low) / span) * 100, 6);
  const dotPct =
    currentTemp != null
      ? Math.min(Math.max(((currentTemp - weekMin) / span) * 100, 2), 98)
      : null;

  return (
    <div className={track} aria-hidden>
      <div
        className="absolute inset-y-0 rounded-full"
        style={{
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          background: `linear-gradient(to right, ${tempColor(low)}, ${tempColor(high)})`,
        }}
      />
      {dotPct != null ? (
        <span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-100 ring-2 ring-zinc-900"
          style={{ left: `${dotPct}%` }}
        />
      ) : null}
    </div>
  );
}

// 바람 나침반 — windDirection(도, 북=0 시계방향)으로 바늘 회전.
function WindCompass({
  deg,
  label,
  speed,
}: {
  deg: number | null;
  label: string | null;
  speed: number;
}) {
  const rot = deg ?? 0;
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-1.5">
      <div className="relative h-[72px] w-[72px] rounded-full border border-zinc-700 bg-zinc-950/60">
        <span className="absolute left-1/2 top-1 -translate-x-1/2 font-mono text-xs text-zinc-400">
          N
        </span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-xs text-zinc-600">
          S
        </span>
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-600">
          W
        </span>
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-600">
          E
        </span>
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <g transform={`rotate(${rot} 50 50)`}>
            <polygon points="50,22 44,52 56,52" fill="rgb(52, 211, 153)" />
            <polygon points="50,78 44,52 56,52" fill="rgb(82, 82, 91)" />
          </g>
          <circle cx="50" cy="50" r="3.5" fill="rgb(228, 228, 231)" />
        </svg>
      </div>
      <span className="font-mono text-xs text-zinc-400">
        {[label, `${speed.toFixed(1)}m/s`].filter(Boolean).join(" · ")}
      </span>
    </div>
  );
}

// 절대 기온 → 색 (cold→hot). 막대 inline gradient 용 (DESIGN.md §14.5 rgb 컨벤션).
function tempColor(t: number): string {
  const stops: Array<[number, [number, number, number]]> = [
    [-5, [34, 211, 238]], // cyan-400
    [8, [52, 211, 153]], // emerald-400
    [18, [251, 191, 36]], // amber-400
    [30, [251, 113, 133]], // rose-400
  ];
  if (t <= stops[0][0]) return rgbStr(stops[0][1]);
  const last = stops[stops.length - 1];
  if (t >= last[0]) return rgbStr(last[1]);
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (t >= t0 && t <= t1) {
      const f = (t - t0) / (t1 - t0);
      return rgbStr([
        Math.round(c0[0] + (c1[0] - c0[0]) * f),
        Math.round(c0[1] + (c1[1] - c0[1]) * f),
        Math.round(c0[2] + (c1[2] - c0[2]) * f),
      ]);
    }
  }
  return rgbStr(stops[0][1]);
}

function rgbStr([r, g, b]: [number, number, number]): string {
  return `rgb(${r}, ${g}, ${b})`;
}
