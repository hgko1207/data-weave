import type { WeatherConfig } from "./schema";

export type WeatherRegion = Pick<WeatherConfig, "regionName" | "nx" | "ny" | "sidoName"> & {
  // KMA 중기예보 (3~10일) 지역 코드
  // - midTermLandId: 중기육상예보 (날씨 상태) — 광역 단위
  // - midTermTaId:   중기기온예보 (일 최저/최고) — 시·시군구 단위
  midTermLandId?: string;
  midTermTaId?: string;
};

export const WEATHER_REGIONS: WeatherRegion[] = [
  { regionName: "서울", nx: 60, ny: 127, sidoName: "서울", midTermLandId: "11B00000", midTermTaId: "11B10101" },
  { regionName: "부산", nx: 98, ny: 76, sidoName: "부산", midTermLandId: "11H20000", midTermTaId: "11H20201" },
  { regionName: "대구", nx: 89, ny: 90, sidoName: "대구", midTermLandId: "11H10000", midTermTaId: "11H10701" },
  { regionName: "인천", nx: 55, ny: 124, sidoName: "인천", midTermLandId: "11B00000", midTermTaId: "11B20201" },
  { regionName: "광주", nx: 58, ny: 74, sidoName: "광주", midTermLandId: "11F20000", midTermTaId: "11F20501" },
  { regionName: "대전", nx: 67, ny: 100, sidoName: "대전", midTermLandId: "11C20000", midTermTaId: "11C20401" },
  { regionName: "울산", nx: 102, ny: 84, sidoName: "울산", midTermLandId: "11H20000", midTermTaId: "11H20101" },
  { regionName: "세종", nx: 66, ny: 103, sidoName: "세종", midTermLandId: "11C20000", midTermTaId: "11C20404" },
  { regionName: "수원", nx: 60, ny: 121, sidoName: "경기", midTermLandId: "11B00000", midTermTaId: "11B20601" },
  { regionName: "춘천", nx: 73, ny: 134, sidoName: "강원", midTermLandId: "11D10000", midTermTaId: "11D10301" },
  { regionName: "청주", nx: 69, ny: 106, sidoName: "충북", midTermLandId: "11C10000", midTermTaId: "11C10301" },
  { regionName: "전주", nx: 63, ny: 89, sidoName: "전북", midTermLandId: "11F10000", midTermTaId: "11F10201" },
  { regionName: "제주", nx: 53, ny: 38, sidoName: "제주", midTermLandId: "11G00000", midTermTaId: "11G00201" },
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
