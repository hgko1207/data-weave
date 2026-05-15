import { XMLParser } from "fast-xml-parser";
import type { WidgetContext } from "../_types";
import {
  apartmentConfigSchema,
  apartmentDataSchema,
  type ApartmentConfig,
  type ApartmentData,
  type ApartmentTrade,
} from "./schema";
import { buildMockApartment } from "./mock";
import { logger } from "@/lib/logger";

const APT_TRADE_BASE =
  "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade";

const xmlParser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
});

export async function fetchApartment(ctx: WidgetContext): Promise<ApartmentData> {
  const cfg = apartmentConfigSchema.parse(ctx.config);
  const key = process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_KEY;

  const dealYm = cfg.dealYm.match(/^\d{6}$/) ? cfg.dealYm : currentKstYm(ctx.now);
  const region = `${cfg.sido} ${cfg.sigungu}`;

  if (!key || !cfg.lawdCd) {
    logger.info("apartment.fetch fallback to mock", {
      reason: !key ? "no MOLIT/DATA_GO_KR key" : "no lawdCd",
    });
    return apartmentDataSchema.parse(buildMockApartment(region, dealYm));
  }

  try {
    const rows = await fetchAllTrades(key, cfg.lawdCd, dealYm, ctx.abort);
    const trades = rows.map(normalizeTrade).filter((t): t is ApartmentTrade => t !== null);

    if (trades.length === 0) {
      // 빈 결과 — live 호출은 성공이지만 그 달 거래 0건. mock 대신 빈 데이터.
      return apartmentDataSchema.parse({
        region,
        dealYm,
        trades: [],
        totalCount: 0,
        avgAmount: null,
        medianAmount: null,
        minAmount: null,
        maxAmount: null,
        source: "live",
      });
    }

    const amounts = trades.map((t) => t.dealAmount).sort((a, b) => a - b);
    const sum = amounts.reduce((a, b) => a + b, 0);
    const median = amounts[Math.floor(amounts.length / 2)];

    return apartmentDataSchema.parse({
      region,
      dealYm,
      trades: trades
        .sort((a, b) => b.dealDate.localeCompare(a.dealDate))
        .slice(0, 200),
      totalCount: trades.length,
      avgAmount: Math.round(sum / amounts.length),
      medianAmount: median,
      minAmount: amounts[0],
      maxAmount: amounts[amounts.length - 1],
      source: "live",
    });
  } catch (err) {
    logger.warn("apartment.fetch live failed, using mock", {
      lawdCd: cfg.lawdCd,
      dealYm,
      error: err instanceof Error ? err.message : String(err),
    });
    return apartmentDataSchema.parse(buildMockApartment(region, dealYm));
  }
}

async function fetchAllTrades(
  serviceKey: string,
  lawdCd: string,
  dealYm: string,
  abort: AbortSignal,
): Promise<RawTrade[]> {
  // 1페이지 100건 기준 (대부분 시·군·구는 한 달 100건 이하)
  const params = new URLSearchParams({
    serviceKey: normalizeServiceKey(serviceKey),
    LAWD_CD: lawdCd,
    DEAL_YMD: dealYm,
    pageNo: "1",
    numOfRows: "300",
  });
  const url = `${APT_TRADE_BASE}?${params.toString()}`;
  const res = await fetch(url, { signal: abort });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return extractTrades(text);
}

type RawTrade = Record<string, unknown>;

function extractTrades(text: string): RawTrade[] {
  // API는 XML 반환 (국토교통부 RTMS는 JSON 미지원).
  const parsed = xmlParser.parse(text) as unknown;
  const items = walkForItems(parsed);
  if (!items) return [];
  return (Array.isArray(items) ? items : [items]) as RawTrade[];
}

function walkForItems(node: unknown): unknown {
  if (!node || typeof node !== "object") return null;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === "item") return value;
    const nested = walkForItems(value);
    if (nested) return nested;
  }
  return null;
}

function normalizeTrade(row: RawTrade): ApartmentTrade | null {
  const aptName = pickString(row, ["aptNm", "aptName", "APT_NM"]);
  const dong = pickString(row, ["umdNm", "umdName", "UMD_NM"]) ?? "";
  const jibun = pickString(row, ["jibun", "JIBUN"]) ?? null;
  const year = pickNumber(row, ["dealYear", "DEAL_YEAR"]);
  const month = pickNumber(row, ["dealMonth", "DEAL_MONTH"]);
  const day = pickNumber(row, ["dealDay", "DEAL_DAY"]);
  const amountRaw = pickString(row, ["dealAmount", "DEAL_AMOUNT"]);
  const area = pickNumber(row, ["excluUseAr", "EXCLU_USE_AR"]);
  const floor = pickNumber(row, ["floor", "FLOOR"]);
  const buildYear = pickNumber(row, ["buildYear", "BUILD_YEAR"]);

  if (!aptName || !amountRaw || year == null || month == null || day == null) {
    return null;
  }
  const dealAmount = parseAmount(amountRaw);
  if (!Number.isFinite(dealAmount) || dealAmount <= 0) return null;
  const dealDate = `${year}-${pad(month)}-${pad(day)}`;
  const areaNum = area ?? 0;
  const pricePerPyeong =
    areaNum > 0 ? Math.round((dealAmount / (areaNum / 3.3058)) * 10) / 10 : null;

  return {
    id: `${aptName}-${dealDate}-${jibun ?? ""}-${dealAmount}`,
    aptName: aptName.trim(),
    dong: dong.trim(),
    jibun,
    dealDate,
    dealAmount,
    area: areaNum,
    pricePerPyeong,
    floor: floor ?? null,
    buildYear: buildYear ?? null,
  };
}

function pickString(row: RawTrade, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim().length > 0) return v;
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

function pickNumber(row: RawTrade, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v.replace(/[, ]/g, ""));
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function parseAmount(raw: string): number {
  return Number(raw.replace(/[, ]/g, ""));
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function currentKstYm(now: Date): string {
  const tz = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  return `${tz.getFullYear()}${pad(tz.getMonth() + 1)}`;
}

function normalizeServiceKey(k: string): string {
  return k.includes("%") ? decodeURIComponent(k) : k;
}

export function previousMonth(ym: string): string {
  if (!ym.match(/^\d{6}$/)) return ym;
  const y = Number(ym.slice(0, 4));
  const m = Number(ym.slice(4, 6));
  const prev = new Date(y, m - 2, 1);
  return `${prev.getFullYear()}${pad(prev.getMonth() + 1)}`;
}

export function nextMonth(ym: string): string {
  if (!ym.match(/^\d{6}$/)) return ym;
  const y = Number(ym.slice(0, 4));
  const m = Number(ym.slice(4, 6));
  const next = new Date(y, m, 1);
  return `${next.getFullYear()}${pad(next.getMonth() + 1)}`;
}

export function formatYm(ym: string): string {
  if (!ym.match(/^\d{6}$/)) return ym;
  return `${ym.slice(0, 4)}년 ${Number(ym.slice(4, 6))}월`;
}

export function currentKstYmExport(now: Date = new Date()): string {
  return currentKstYm(now);
}

export type MonthlyTrendPoint = {
  ym: string;
  label: string;
  avg: number | null;
  count: number;
};

/**
 * 최근 N개월(현재 포함) 평균 매매가 추이.
 * 각 월별로 fetchApartment를 병렬 호출 — 6 month = 6 API calls.
 */
export async function fetchMonthlyTrend(
  serviceKey: string,
  lawdCd: string,
  months: number,
  now: Date,
  abort: AbortSignal,
): Promise<MonthlyTrendPoint[]> {
  const ymList: string[] = [];
  const current = currentKstYm(now);
  const y0 = Number(current.slice(0, 4));
  const m0 = Number(current.slice(4, 6));
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(y0, m0 - 1 - i, 1);
    ymList.push(`${d.getFullYear()}${pad(d.getMonth() + 1)}`);
  }
  const results = await Promise.all(
    ymList.map(async (ym) => {
      try {
        const rows = await fetchAllTrades(serviceKey, lawdCd, ym, abort);
        const trades = rows.map(normalizeTrade).filter((t): t is ApartmentTrade => t !== null);
        if (trades.length === 0) {
          return { ym, label: monthLabel(ym), avg: null, count: 0 };
        }
        const sum = trades.reduce((acc, t) => acc + t.dealAmount, 0);
        return {
          ym,
          label: monthLabel(ym),
          avg: Math.round(sum / trades.length),
          count: trades.length,
        };
      } catch {
        return { ym, label: monthLabel(ym), avg: null, count: 0 };
      }
    }),
  );
  return results;
}

function monthLabel(ym: string): string {
  if (!ym.match(/^\d{6}$/)) return ym;
  return `${Number(ym.slice(4, 6))}월`;
}
