import type { WidgetContext } from "../_types";
import {
  libraryConfigSchema,
  libraryDataSchema,
  type LibraryData,
} from "./schema";
import { buildMockLibrary } from "./mock";
import { logger } from "@/lib/logger";

// 정보나루 (data4library.kr) OpenAPI — 별도 가입/키 발급 또는 data.go.kr 연동.
// 현재는 spec 미확정으로 mock 우선. API 키 획득 후 실제 endpoint로 교체:
//   - 도서관 검색:  https://data4library.kr/api/libSrch
//   - 도서 검색:    https://data4library.kr/api/srchBooks
//   - 책 소장 도서관: https://data4library.kr/api/libSrchByBook
//   요구 파라미터: authKey, region(시·도 코드), dtl_region(시·군·구 코드), keyword, format=json
// 키가 없거나 활용신청 미승인이면 mock으로 자연스럽게 폴백.

export async function fetchLibrary(ctx: WidgetContext): Promise<LibraryData> {
  const cfg = libraryConfigSchema.parse(ctx.config);
  const key = process.env.LIBRARY_API_KEY || process.env.DATA_GO_KR_KEY;

  // mock 폴백 — 키 없음 또는 spec 미연동 상태.
  if (!key) {
    logger.info("library.fetch fallback to mock", { reason: "no LIBRARY/DATA_GO_KR key" });
    return libraryDataSchema.parse(buildMockLibrary(cfg.sido, cfg.sigungu, cfg.mode, cfg.q));
  }

  // 실 API 연동은 활용신청 + endpoint spec 확정 후 추가.
  // 일단 mock 반환해서 위젯이 안전하게 동작.
  return libraryDataSchema.parse(buildMockLibrary(cfg.sido, cfg.sigungu, cfg.mode, cfg.q));
}
