// 시·도 중심점 좌표 (시청·도청 기준). 시·군·구 단위 geocoding 없을 때 폴백 원점.
export const SIDO_CENTERS: Record<string, { lat: number; lng: number }> = {
  "서울특별시": { lat: 37.5665, lng: 126.978 },
  "부산광역시": { lat: 35.1796, lng: 129.0756 },
  "대구광역시": { lat: 35.8714, lng: 128.6014 },
  "인천광역시": { lat: 37.4563, lng: 126.7052 },
  "광주광역시": { lat: 35.1595, lng: 126.8526 },
  "대전광역시": { lat: 36.3504, lng: 127.3845 },
  "울산광역시": { lat: 35.5384, lng: 129.3114 },
  "세종특별자치시": { lat: 36.48, lng: 127.289 },
  "경기도": { lat: 37.4138, lng: 127.5183 },
  "강원특별자치도": { lat: 37.8228, lng: 128.1555 },
  "충청북도": { lat: 36.6357, lng: 127.4912 },
  "충청남도": { lat: 36.6588, lng: 126.6728 },
  "전북특별자치도": { lat: 35.7167, lng: 127.144 },
  "전라남도": { lat: 34.8161, lng: 126.4629 },
  "경상북도": { lat: 36.4919, lng: 128.8889 },
  "경상남도": { lat: 35.4606, lng: 128.2132 },
  "제주특별자치도": { lat: 33.4996, lng: 126.5312 },
};

export const DEFAULT_SIDO_CENTER = SIDO_CENTERS["대전광역시"];

export function getSidoCenter(sido: string): { lat: number; lng: number } {
  return SIDO_CENTERS[sido] ?? DEFAULT_SIDO_CENTER;
}
