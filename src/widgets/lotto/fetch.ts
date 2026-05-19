import type { WidgetContext } from "../_types";
import { lottoConfigSchema, lottoDataSchema, type LottoData } from "./schema";
import { buildMockLotto, currentLatestRound } from "./mock";
import { logger } from "@/lib/logger";

// 동행복권 회차 정보 — 공식 API/스크래핑 spec 확정 후 연동.
//   - 당첨번호: https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=<round>
//   - 1등 배출점: https://www.dhlottery.co.kr/store.do?method=topStore&drwNo=<round> (HTML 파싱)
// 별도 인증키 불필요하지만 응답 포맷이 자주 바뀌어 스크래핑 안정성 고려 필요.
// 현재는 mock — 회차 시드 기반 결정적 데이터.

export async function fetchLotto(ctx: WidgetContext): Promise<LottoData> {
  const cfg = lottoConfigSchema.parse(ctx.config);
  const latest = currentLatestRound(ctx.now);
  // round이 null이거나 미래 회차면 latest로 clamp.
  const round = cfg.round && cfg.round > 0 && cfg.round <= latest ? cfg.round : latest;

  logger.info("lotto.fetch fallback to mock", { round, latest });
  return lottoDataSchema.parse(buildMockLotto(round, latest));
}
