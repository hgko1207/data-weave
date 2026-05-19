import type { WidgetContext } from "../_types";
import { tourConfigSchema, tourDataSchema, type TourData } from "./schema";
import { buildMockTour } from "./mock";
import { logger } from "@/lib/logger";

// 한국관광공사 TourAPI 4.0 (data.go.kr / B551011 시리즈) — 활용신청 후 endpoint 연동.
//   - areaBasedList2 — 지역 기반 관광 정보
//   - searchKeyword2 — 키워드 검색
//   - searchFestival2 — 축제 검색
//   contentTypeId 12(관광지) / 14(문화시설) / 15(축제·공연·행사) / 28(레저) / 38(쇼핑)
// 현재는 mock 우선. TOUR_API_KEY 또는 DATA_GO_KR_KEY 활용신청 후 실 endpoint 연동.

export async function fetchTour(ctx: WidgetContext): Promise<TourData> {
  const cfg = tourConfigSchema.parse(ctx.config);
  const key = process.env.TOUR_API_KEY || process.env.DATA_GO_KR_KEY;

  if (!key) {
    logger.info("tour.fetch fallback to mock", { reason: "no TOUR/DATA_GO_KR key" });
    return tourDataSchema.parse(buildMockTour(cfg.sido, cfg.sigungu, cfg.category));
  }

  // 실 API 연동은 활용신청 + endpoint spec 확정 후. 일단 mock.
  return tourDataSchema.parse(buildMockTour(cfg.sido, cfg.sigungu, cfg.category));
}
