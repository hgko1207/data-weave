import type { WidgetContext } from "../_types";
import { priceConfigSchema, priceDataSchema, type PriceData } from "./schema";
import { buildMockPrice } from "./mock";
import { defaultItem, findItem } from "./catalog";
import { logger } from "@/lib/logger";

// 농산물유통정보 KAMIS OpenAPI — 활용신청 + spec 확정 후 연동.
//   - 가격 정보: 일별/주별/월별 도매·소매 가격
//   - 카테고리/품목별 코드 체계 사용 — 별도 매핑 필요
// 현재는 mock — 품목 기반 결정적 가격.

export async function fetchPrice(ctx: WidgetContext): Promise<PriceData> {
  const cfg = priceConfigSchema.parse(ctx.config);
  const key = process.env.KAMIS_API_KEY || process.env.DATA_GO_KR_KEY;

  const item = (cfg.item && findItem(cfg.category, cfg.item)) || defaultItem(cfg.category);

  if (!key) {
    logger.info("price.fetch fallback to mock", { reason: "no KAMIS/DATA_GO_KR key" });
    return priceDataSchema.parse(buildMockPrice(item, ctx.now));
  }

  // 실 API 연동 예정 — 일단 mock.
  return priceDataSchema.parse(buildMockPrice(item, ctx.now));
}
