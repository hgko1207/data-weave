import type { WeatherConfig } from "./schema";

export type WeatherRegion = Pick<WeatherConfig, "regionName" | "nx" | "ny" | "sidoName">;

export const WEATHER_REGIONS: WeatherRegion[] = [
  { regionName: "서울", nx: 60, ny: 127, sidoName: "서울" },
  { regionName: "부산", nx: 98, ny: 76, sidoName: "부산" },
  { regionName: "대구", nx: 89, ny: 90, sidoName: "대구" },
  { regionName: "인천", nx: 55, ny: 124, sidoName: "인천" },
  { regionName: "광주", nx: 58, ny: 74, sidoName: "광주" },
  { regionName: "대전", nx: 67, ny: 100, sidoName: "대전" },
  { regionName: "울산", nx: 102, ny: 84, sidoName: "울산" },
  { regionName: "세종", nx: 66, ny: 103, sidoName: "세종" },
  { regionName: "수원", nx: 60, ny: 121, sidoName: "경기" },
  { regionName: "춘천", nx: 73, ny: 134, sidoName: "강원" },
  { regionName: "청주", nx: 69, ny: 106, sidoName: "충북" },
  { regionName: "전주", nx: 63, ny: 89, sidoName: "전북" },
  { regionName: "제주", nx: 53, ny: 38, sidoName: "제주" },
];

export const DEFAULT_WEATHER_REGION = WEATHER_REGIONS.find(
  (r) => r.regionName === "대전",
)!;

export function findWeatherRegion(name?: string): WeatherRegion {
  if (!name) return DEFAULT_WEATHER_REGION;
  return (
    WEATHER_REGIONS.find((r) => r.regionName === name) ?? DEFAULT_WEATHER_REGION
  );
}
