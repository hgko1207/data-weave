import type { PharmacyConfig, SosData } from "./schema";

export function buildMockSos(cfg: PharmacyConfig): SosData {
  return {
    region: `${cfg.sido} ${cfg.sigungu}`,
    queriedAt: new Date().toISOString(),
    radiusKm: cfg.radiusKm,
    origin: { lat: cfg.lat, lng: cfg.lng },
    list: [
      {
        kind: "pharmacy",
        name: "유성온천역 24시 약국",
        address: "대전 유성구 봉명동 123-4",
        phone: "042-123-4567",
        lat: cfg.lat + 0.004,
        lng: cfg.lng + 0.003,
        distanceKm: 0.5,
        hoursToday: "00:00 - 24:00",
      },
      {
        kind: "er",
        name: "충남대학교병원 응급실",
        address: "대전 중구 문화로 282",
        phone: "042-280-8114",
        lat: cfg.lat - 0.012,
        lng: cfg.lng - 0.018,
        distanceKm: 2.1,
        hoursToday: "24시간",
      },
      {
        kind: "pharmacy",
        name: "유성구청 앞 야간약국",
        address: "대전 유성구 대학로 99",
        phone: "042-555-1212",
        lat: cfg.lat + 0.008,
        lng: cfg.lng - 0.006,
        distanceKm: 1.2,
        hoursToday: "20:00 - 02:00",
      },
      {
        kind: "er",
        name: "대전선병원 응급실",
        address: "대전 중구 목중로 29",
        phone: "042-220-8000",
        lat: cfg.lat - 0.025,
        lng: cfg.lng - 0.028,
        distanceKm: 3.4,
        hoursToday: "24시간",
      },
      {
        kind: "pharmacy",
        name: "둔산 휴일지킴이약국",
        address: "대전 서구 둔산로 100",
        phone: "042-471-2222",
        lat: cfg.lat - 0.018,
        lng: cfg.lng - 0.045,
        distanceKm: 4.7,
        hoursToday: "공휴일 09:00 - 22:00",
      },
    ],
    source: "mock",
  };
}
