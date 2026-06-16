import { SIDO_CENTERS } from "@/widgets/pharmacy/sido-centers";

// 사용자 위치(lat/lng) → 가장 가까운 시·도 정식명 반환.
// SIDO_CENTERS는 시청·도청 좌표라 시·도 단위 매칭 충분히 정확.
export function nearestSido(lat: number, lng: number): string {
  let best: string = "서울특별시";
  let bestDist = Number.POSITIVE_INFINITY;
  for (const [sido, c] of Object.entries(SIDO_CENTERS)) {
    const dist = haversine(lat, lng, c.lat, c.lng);
    if (dist < bestDist) {
      bestDist = dist;
      best = sido;
    }
  }
  return best;
}

// Haversine — 두 좌표 간 거리 (km). 시·도 매칭에 충분한 정밀도.
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const USER_SIDO_COOKIE = "dataweave_sido";
export const USER_SIDO_STORAGE = "dataweave.userSido";

// 위젯별 region 파라미터 매핑.
// weather는 약식("대전"), 다른 위젯은 정식("대전광역시")을 받음.
const WEATHER_REGION_MAP: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "수원",
  강원특별자치도: "춘천",
  충청북도: "청주",
  충청남도: "대전", // 충남도청은 홍성이지만 weather 위젯은 도시 단위라 대전으로 폴백
  전북특별자치도: "전주",
  전라남도: "광주",
  경상북도: "대구",
  경상남도: "부산",
  제주특별자치도: "제주",
};

export function toWeatherRegion(sido: string): string {
  return WEATHER_REGION_MAP[sido] ?? "대전";
}
