import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import { DataSourceNotice } from "@/components/widget/DataSourceNotice";
import { RegionPicker } from "@/components/widget/weather/RegionPicker";
import { WeatherDetail } from "@/components/widget/weather/WeatherDetail";
import { WeatherBackdrop } from "@/components/widget/weather/WeatherBackdrop";
import { fetchWeather } from "@/widgets/weather/fetch";
import { findWeatherRegion } from "@/widgets/weather/regions";
import { weatherDataSchema, type WeatherData } from "@/widgets/weather/schema";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ region?: string }>;
};

export default async function WeatherDetailPage({ searchParams }: Props) {
  const { region: regionParam } = await searchParams;
  const region = findWeatherRegion(regionParam);

  let data: WeatherData;
  let errorMessage: string | undefined;
  try {
    data = await fetchWeather({
      config: {
        v: 1,
        regionName: region.regionName,
        nx: region.nx,
        ny: region.ny,
        sidoName: region.sidoName,
        midTermLandId: region.midTermLandId,
        midTermTaId: region.midTermTaId,
      },
      abort: new AbortController().signal,
      now: new Date(),
    });
  } catch (err) {
    logger.warn("weather detail page fetch failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
    data = weatherDataSchema.parse({
      region: region.regionName,
      observedAt: new Date().toISOString(),
      temp: 0,
      feelsLike: null,
      pop: 0,
      skyText: "정보 없음",
      pm10Value: null,
      pm10Grade: "정보 없음",
      pm25Value: null,
      pm25Grade: "정보 없음",
      humidity: null,
      windSpeed: null,
      windDirection: null,
      windDirectionLabel: null,
      precipitation: null,
      todayHigh: null,
      todayLow: null,
      hourly: [],
      daily: [],
      source: "mock",
    });
  }

  return (
    <>
      <WeatherBackdrop observedAt={data.observedAt} />
      <div className="relative z-10">
        <PageFrame
          eyebrow="widget · weather"
          title={`날씨 · ${data.region}`}
          description="기상청 단기예보 + 에어코리아 미세먼지. 지역을 선택해 즉시 갱신됩니다."
          actions={
            <>
              <BookmarkButton label={`날씨 · ${data.region}`} widgetId="weather" />
              <Link
                href="/"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                대시보드
              </Link>
            </>
          }
        >
          <RegionPicker active={region.regionName} />
          <DataSourceNotice errorMessage={errorMessage} source={data.source} />
          <WeatherDetail data={data} />
        </PageFrame>
      </div>
    </>
  );
}
