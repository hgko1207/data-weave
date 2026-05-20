import type { WidgetContext } from "../_types";
import { priceConfigSchema, priceDataSchema, type PriceData, type PriceItem } from "./schema";
import { buildMockPrice } from "./mock";
import { CATEGORY_CODE } from "./catalog";
import { logger } from "@/lib/logger";

// KAMIS 농산물유통정보 — 일별 부류별 도소매 가격.
// http://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList&...
//   p_product_cls_code: 01(소매) / 02(도매)
//   p_item_category_code: 100 식량 / 200 채소 / 400 과일 / 500 축산 / 600 수산
//   p_regday: YYYY-MM-DD, p_convert_kg_yn: Y, p_cert_key, p_cert_id, p_returntype=json
// 인증키(p_cert_key=KAMIS_API_KEY) + 요청자 id(p_cert_id=KAMIS_CERT_ID) 둘 다 필요.
const KAMIS_BASE = "http://www.kamis.or.kr/service/price/xml.do";

type RawItem = {
  item_name?: string;
  item_code?: string;
  kind_name?: string;
  kind_code?: string;
  rank?: string;
  rank_code?: string;
  unit?: string;
  dpr1?: string; // 당일
  dpr2?: string; // 1일전
  dpr3?: string; // 1주일전
};

export async function fetchPrice(ctx: WidgetContext): Promise<PriceData> {
  const cfg = priceConfigSchema.parse(ctx.config);
  const key = process.env.KAMIS_API_KEY;
  const certId = process.env.KAMIS_CERT_ID;
  const regday = recentKstDate(ctx.now);

  if (!key || !certId) {
    logger.info("price.fetch fallback to mock", { reason: "no KAMIS key/cert id" });
    return priceDataSchema.parse(buildMockPrice(cfg.category, cfg.cls, regday));
  }

  try {
    const params = new URLSearchParams({
      action: "dailyPriceByCategoryList",
      p_product_cls_code: cfg.cls === "wholesale" ? "02" : "01",
      p_item_category_code: CATEGORY_CODE[cfg.category],
      p_country_code: "", // 전국 평균
      p_regday: regday,
      p_convert_kg_yn: "Y",
      p_cert_key: key,
      p_cert_id: certId,
      p_returntype: "json",
    });
    const res = await fetch(`${KAMIS_BASE}?${params.toString()}`, { signal: ctx.abort });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    const parsed = JSON.parse(text) as {
      data?: { error_code?: string; item?: RawItem | RawItem[] };
    };
    const errorCode = parsed.data?.error_code;
    if (errorCode && errorCode !== "000") {
      throw new Error(`KAMIS error_code ${errorCode}`);
    }
    const rawItems = parsed.data?.item;
    const list = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
    const items = list
      .map((r, i) => normalize(r, i))
      .filter((it): it is PriceItem => it !== null);

    if (items.length === 0) {
      logger.warn("price.fetch empty, using mock", { category: cfg.category, regday });
      return priceDataSchema.parse(buildMockPrice(cfg.category, cfg.cls, regday));
    }

    return priceDataSchema.parse({
      category: cfg.category,
      cls: cfg.cls,
      regday,
      items: items.slice(0, 200),
      source: "live",
    });
  } catch (err) {
    logger.warn("price.fetch failed, using mock", {
      category: cfg.category,
      regday,
      error: err instanceof Error ? err.message : String(err),
    });
    return priceDataSchema.parse(buildMockPrice(cfg.category, cfg.cls, regday));
  }
}

function normalize(row: RawItem, idx: number): PriceItem | null {
  const itemName = row.item_name?.trim();
  if (!itemName) return null;
  const today = parsePrice(row.dpr1);
  const prevDay = parsePrice(row.dpr2);
  const prevWeek = parsePrice(row.dpr3);
  // 당일·전일·1주일 가격이 모두 없으면 의미 없는 행 — 제외.
  if (today == null && prevDay == null && prevWeek == null) return null;
  return {
    id: `${row.item_code ?? idx}-${row.kind_code ?? ""}-${row.rank_code ?? ""}`,
    itemName,
    kindName: row.kind_name?.trim() || itemName,
    rank: row.rank?.trim() || "상품",
    unit: row.unit?.trim() || "",
    today,
    prevDay,
    prevWeek,
  };
}

function parsePrice(s: string | undefined): number | null {
  if (!s || s === "-") return null;
  const n = Number(s.replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

// KAMIS 당일 데이터는 늦게 갱신되므로 KST 기준 어제를 기본 조회일로.
function recentKstDate(now: Date): string {
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  kst.setDate(kst.getDate() - 1);
  const y = kst.getFullYear();
  const m = String(kst.getMonth() + 1).padStart(2, "0");
  const d = String(kst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
