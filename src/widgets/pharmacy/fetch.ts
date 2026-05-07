import { fetchWidget } from "../_fetch-wrapper";
import type { WidgetContext } from "../_types";
import {
  egenResponseSchema,
  pharmacyConfigSchema,
  sosDataSchema,
  type EgenItem,
  type Facility,
  type PharmacyConfig,
  type SosData,
} from "./schema";
import { buildMockSos } from "./mock";
import { logger } from "@/lib/logger";

const PHARMACY_BASE = "https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire";
const ER_BASE = "https://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytListInfoInqire";

export async function fetchPharmacy(ctx: WidgetContext): Promise<SosData> {
  const cfg = pharmacyConfigSchema.parse(ctx.config);
  const key = process.env.EMERGENCY_API_KEY;

  if (!key) {
    logger.info("pharmacy.fetch fallback to mock", { reason: "no EMERGENCY_API_KEY" });
    return sosDataSchema.parse(buildMockSos(cfg));
  }

  try {
    const [pharmacy, er] = await Promise.all([
      fetchEgen(PHARMACY_BASE, { Q0: cfg.sido, Q1: cfg.sigungu }, key, ctx.abort),
      fetchEgen(ER_BASE, { Q0: cfg.sido, Q1: cfg.sigungu }, key, ctx.abort),
    ]);

    const list = [
      ...normalizeItems(pharmacy, "pharmacy", cfg, ctx.now),
      ...normalizeItems(er, "er", cfg, ctx.now),
    ]
      .filter((f) => Number.isFinite(f.distanceKm) && f.distanceKm <= cfg.radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 12);

    return sosDataSchema.parse({
      region: `${cfg.sido} ${cfg.sigungu}`,
      queriedAt: new Date().toISOString(),
      list,
      radiusKm: cfg.radiusKm,
      origin: { lat: cfg.lat, lng: cfg.lng },
      source: "live",
    });
  } catch (err) {
    logger.warn("pharmacy.fetch live failed, using mock", {
      error: err instanceof Error ? err.message : String(err),
    });
    return sosDataSchema.parse(buildMockSos(cfg));
  }
}

async function fetchEgen(
  base: string,
  q: { Q0: string; Q1: string },
  serviceKey: string,
  abort: AbortSignal,
) {
  const params = new URLSearchParams({
    serviceKey,
    Q0: q.Q0,
    Q1: q.Q1,
    pageNo: "1",
    numOfRows: "100",
    _type: "json",
  });
  return fetchWidget({
    url: `${base}?${params.toString()}`,
    schema: egenResponseSchema,
    abort,
  });
}

type EgenResp = ReturnType<typeof egenResponseSchema.parse>;

function normalizeItems(
  resp: EgenResp,
  kind: "pharmacy" | "er",
  cfg: PharmacyConfig,
  now: Date,
): Facility[] {
  const itemsField = resp.response.body?.items;
  if (!itemsField || typeof itemsField === "string") return [];
  const raw = itemsField.item;
  const arr: EgenItem[] = Array.isArray(raw) ? raw : [raw];
  return arr.flatMap((it) => {
    const name = it.dutyName?.trim();
    if (!name) return [];
    const lat = toNum(it.wgs84Lat);
    const lng = toNum(it.wgs84Lon);
    if (lat == null || lng == null) return [];
    return [
      {
        kind,
        name,
        address: (it.dutyAddr ?? "").trim(),
        phone: it.dutyTel1?.trim() || null,
        lat,
        lng,
        distanceKm: round(haversineKm(cfg.lat, cfg.lng, lat, lng), 2),
        hoursToday: hoursToday(it, now),
      },
    ];
  });
}

function toNum(v: string | number | undefined): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : null;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function round(n: number, digits: number): number {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

function hoursToday(item: EgenItem, now: Date): string | null {
  const dow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })).getDay();
  const idx = dow === 0 ? 7 : dow;
  const start = (item as Record<string, string | undefined>)[`dutyTime${idx}s`];
  const close = (item as Record<string, string | undefined>)[`dutyTime${idx}c`];
  if (!start || !close) return null;
  return `${formatHHMM(start)} - ${formatHHMM(close)}`;
}

function formatHHMM(s: string): string {
  if (s.length !== 4) return s;
  return `${s.slice(0, 2)}:${s.slice(2)}`;
}
