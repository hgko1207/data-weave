import { XMLParser } from "fast-xml-parser";
import type { WidgetContext } from "../_types";
import {
  rentConfigSchema,
  rentDataSchema,
  type RentData,
  type RentTrade,
} from "./schema";
import { buildMockRent } from "./mock";
import { logger } from "@/lib/logger";

const RENT_BASE =
  "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent";

const xmlParser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
});

export async function fetchRent(ctx: WidgetContext): Promise<RentData> {
  const cfg = rentConfigSchema.parse(ctx.config);
  const key = process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_KEY;

  const dealYm = cfg.dealYm.match(/^\d{6}$/) ? cfg.dealYm : currentKstYm(ctx.now);
  const region = `${cfg.sido} ${cfg.sigungu}`;

  if (!key || !cfg.lawdCd) {
    logger.info("rent.fetch fallback to mock", {
      reason: !key ? "no MOLIT/DATA_GO_KR key" : "no lawdCd",
    });
    return rentDataSchema.parse(buildMockRent(region, dealYm));
  }

  try {
    const rows = await fetchAllRents(key, cfg.lawdCd, dealYm, ctx.abort);
    const trades = rows.map(normalizeTrade).filter((t): t is RentTrade => t !== null);

    if (trades.length === 0) {
      return rentDataSchema.parse({
        region,
        dealYm,
        trades: [],
        totalCount: 0,
        jeonseCount: 0,
        monthlyCount: 0,
        avgJeonseDeposit: null,
        avgMonthlyDeposit: null,
        avgMonthlyRent: null,
        source: "live",
      });
    }

    const jeonse = trades.filter((t) => t.type === "jeonse");
    const monthly = trades.filter((t) => t.type === "monthly");

    return rentDataSchema.parse({
      region,
      dealYm,
      trades: trades
        .sort((a, b) => b.dealDate.localeCompare(a.dealDate))
        .slice(0, 200),
      totalCount: trades.length,
      jeonseCount: jeonse.length,
      monthlyCount: monthly.length,
      avgJeonseDeposit:
        jeonse.length > 0
          ? Math.round(jeonse.reduce((a, t) => a + t.deposit, 0) / jeonse.length)
          : null,
      avgMonthlyDeposit:
        monthly.length > 0
          ? Math.round(monthly.reduce((a, t) => a + t.deposit, 0) / monthly.length)
          : null,
      avgMonthlyRent:
        monthly.length > 0
          ? Math.round(monthly.reduce((a, t) => a + t.monthlyRent, 0) / monthly.length)
          : null,
      source: "live",
    });
  } catch (err) {
    logger.warn("rent.fetch live failed, using mock", {
      lawdCd: cfg.lawdCd,
      dealYm,
      error: err instanceof Error ? err.message : String(err),
    });
    return rentDataSchema.parse(buildMockRent(region, dealYm));
  }
}

async function fetchAllRents(
  serviceKey: string,
  lawdCd: string,
  dealYm: string,
  abort: AbortSignal,
): Promise<RawTrade[]> {
  const params = new URLSearchParams({
    serviceKey: normalizeServiceKey(serviceKey),
    LAWD_CD: lawdCd,
    DEAL_YMD: dealYm,
    pageNo: "1",
    numOfRows: "300",
  });
  const url = `${RENT_BASE}?${params.toString()}`;
  const res = await fetch(url, { signal: abort });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return extractTrades(text);
}

type RawTrade = Record<string, unknown>;

function extractTrades(text: string): RawTrade[] {
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

function normalizeTrade(row: RawTrade): RentTrade | null {
  const aptName = pickString(row, ["aptNm", "APT_NM", "aptName"]);
  const dong = pickString(row, ["umdNm", "UMD_NM"]) ?? "";
  const jibun = pickString(row, ["jibun", "JIBUN"]) ?? null;
  const year = pickNumber(row, ["dealYear", "DEAL_YEAR"]);
  const month = pickNumber(row, ["dealMonth", "DEAL_MONTH"]);
  const day = pickNumber(row, ["dealDay", "DEAL_DAY"]);
  const depositRaw = pickString(row, ["deposit", "DEPOSIT"]);
  const monthlyRentRaw = pickString(row, ["monthlyRent", "MONTHLY_RENT", "rent"]);
  const area = pickNumber(row, ["excluUseAr", "EXCLU_USE_AR"]);
  const floor = pickNumber(row, ["floor", "FLOOR"]);
  const buildYear = pickNumber(row, ["buildYear", "BUILD_YEAR"]);

  if (!aptName || !depositRaw || year == null || month == null || day == null) {
    return null;
  }
  const deposit = parseAmount(depositRaw);
  if (!Number.isFinite(deposit) || deposit <= 0) return null;
  const monthlyRent = monthlyRentRaw ? parseAmount(monthlyRentRaw) : 0;
  const validMonthly = Number.isFinite(monthlyRent) ? monthlyRent : 0;
  const dealDate = `${year}-${pad(month)}-${pad(day)}`;

  return {
    id: `${aptName}-${dealDate}-${jibun ?? ""}-${deposit}-${validMonthly}`,
    aptName: aptName.trim(),
    dong: dong.trim(),
    jibun,
    dealDate,
    type: validMonthly > 0 ? "monthly" : "jeonse",
    deposit,
    monthlyRent: validMonthly,
    area: area ?? 0,
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
