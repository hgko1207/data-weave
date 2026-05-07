import type { WidgetContext } from "../_types";
import {
  foodRecallConfigSchema,
  foodRecallDataSchema,
  type FoodRecallData,
  type FoodRecallConfig,
  type RecallItem,
} from "./schema";
import { mockRecalls } from "./mock";
import { logger } from "@/lib/logger";

const MFDS_BASE =
  "https://apis.data.go.kr/1471000/RClnFdProductInfoService01/getRClnFdProductInfoService01";

export async function fetchFoodRecall(ctx: WidgetContext): Promise<FoodRecallData> {
  const cfg = foodRecallConfigSchema.parse(ctx.config);
  const key = process.env.MFDS_API_KEY;

  if (!key) {
    logger.info("food-recall.fetch fallback to mock", { reason: "no MFDS_API_KEY" });
    return assemble(mockRecalls, cfg, "mock");
  }

  try {
    const items = await fetchFromMfds(key, ctx.abort);
    return assemble(items, cfg, "live");
  } catch (err) {
    logger.warn("food-recall.fetch live failed, using mock", {
      error: err instanceof Error ? err.message : String(err),
    });
    return assemble(mockRecalls, cfg, "mock");
  }
}

async function fetchFromMfds(serviceKey: string, abort: AbortSignal): Promise<RecallItem[]> {
  const params = new URLSearchParams({
    serviceKey: normalizeServiceKey(serviceKey),
    pageNo: "1",
    numOfRows: "100",
    type: "json",
  });
  const res = await fetch(`${MFDS_BASE}?${params.toString()}`, {
    signal: abort,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as unknown;
  return extractRecalls(json);
}

function extractRecalls(json: unknown): RecallItem[] {
  const raw = findItemsArray(json);
  return raw.flatMap((it) => {
    const r = it as Record<string, unknown>;
    const productName = pick(r, ["PRDLST_NM", "PRDT_NM", "PRDUCT_NM", "productName"]);
    const company = pick(r, ["BSSH_NM", "COMPANY_NM", "BSN_NM", "company"]);
    const reason = pick(r, ["RTRVL_RSON", "RECALL_RSON", "RTRVL_RESN", "reason"]);
    const dateRaw = pick(r, ["RTRVL_DT", "RECALL_DT", "PRMS_DT", "DT", "recallDate"]);
    const image = pick(r, ["IMG_URL", "IMG_URL1", "imageUrl"]);
    if (!productName || !dateRaw) return [];
    return [
      {
        id: `${productName}-${dateRaw}`,
        productName: productName.trim(),
        company: (company ?? "").trim(),
        recallDate: normalizeDate(dateRaw),
        reason: (reason ?? "사유 미기재").trim(),
        imageUrl: image && image.startsWith("http") ? image : null,
      } satisfies RecallItem,
    ];
  });
}

function findItemsArray(json: unknown): unknown[] {
  const candidates: unknown[] = [];
  walk(json, (v, key) => {
    if (
      Array.isArray(v) &&
      v.length > 0 &&
      typeof v[0] === "object" &&
      v[0] != null &&
      (key === "item" || key === "items" || key === "row" || key === "list")
    ) {
      candidates.push(v);
    }
  });
  if (candidates.length === 0) return [];
  // pick the largest array (most likely the recall list)
  return (candidates as unknown[][]).sort((a, b) => b.length - a.length)[0];
}

function walk(node: unknown, visit: (value: unknown, key: string) => void): void {
  if (!node || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    visit(v, k);
    walk(v, visit);
  }
}

function pick(o: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.length > 0) return v;
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

function normalizeDate(raw: string): string {
  // Accepts YYYYMMDD, YYYY-MM-DD, YYYY/MM/DD or ISO
  const compact = raw.replace(/[^0-9]/g, "");
  if (compact.length >= 8) {
    const yyyy = compact.slice(0, 4);
    const mm = compact.slice(4, 6);
    const dd = compact.slice(6, 8);
    return `${yyyy}-${mm}-${dd}T00:00:00+09:00`;
  }
  return raw;
}

function normalizeServiceKey(k: string): string {
  return k.includes("%") ? decodeURIComponent(k) : k;
}

function assemble(
  items: RecallItem[],
  cfg: FoodRecallConfig,
  source: "live" | "mock",
): FoodRecallData {
  const cutoff = Date.now() - cfg.windowHours * 3600_000;
  const within = items.filter((it) => {
    const t = Date.parse(it.recallDate);
    return Number.isFinite(t) && t >= cutoff;
  });

  const matchedKeywords: string[] = [];
  const filtered =
    cfg.allergyKeywords.length === 0
      ? within
      : within.filter((it) => {
          const haystack = `${it.productName} ${it.reason}`.toLowerCase();
          for (const kw of cfg.allergyKeywords) {
            if (kw && haystack.includes(kw.toLowerCase())) {
              if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
              return true;
            }
          }
          return false;
        });

  const sorted = [...filtered].sort(
    (a, b) => Date.parse(b.recallDate) - Date.parse(a.recallDate),
  );

  return foodRecallDataSchema.parse({
    total: within.length,
    filteredTotal: sorted.length,
    items: sorted.slice(0, 10),
    windowHours: cfg.windowHours,
    matchedKeywords,
    source,
  });
}
