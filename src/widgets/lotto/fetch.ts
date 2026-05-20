import type { WidgetContext } from "../_types";
import { lottoConfigSchema, lottoDataSchema, type LottoData, type TopStore } from "./schema";
import { buildMockLotto, currentLatestRound } from "./mock";
import { logger } from "@/lib/logger";

// 동행복권 공개 API — 별도 인증키 불필요.
//   당첨번호: https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=<round>  (JSON)
//   1등 배출점: https://www.dhlottery.co.kr/store.do?method=topStore&pageGubun=L645&drwNo=<round> (HTML)
// 동행복권은 해외 IP를 차단(메인으로 redirect)하므로 한국에서만 동작. 실패 시 mock 폴백.
const LOTTO_NUMBER_BASE = "https://www.dhlottery.co.kr/common.do";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  Referer: "https://www.dhlottery.co.kr/",
} as const;

type RawDraw = {
  returnValue?: string;
  drwNo?: number;
  drwNoDate?: string;
  drwtNo1?: number;
  drwtNo2?: number;
  drwtNo3?: number;
  drwtNo4?: number;
  drwtNo5?: number;
  drwtNo6?: number;
  bnusNo?: number;
  firstWinamnt?: number; // 1등 1인당 당첨금
  firstPrzwnerCo?: number; // 1등 당첨자 수
};

export async function fetchLotto(ctx: WidgetContext): Promise<LottoData> {
  const cfg = lottoConfigSchema.parse(ctx.config);
  const latest = currentLatestRound(ctx.now);
  const round = cfg.round && cfg.round > 0 && cfg.round <= latest ? cfg.round : latest;

  try {
    const raw = await fetchDraw(round, ctx.abort);
    if (!raw || raw.returnValue !== "success") {
      // 아직 추첨 안 됐거나 응답 이상 — 직전 회차로 한 번 더 시도.
      if (round === latest && round > 1) {
        const prev = await fetchDraw(round - 1, ctx.abort);
        if (prev && prev.returnValue === "success") {
          return normalize(prev, round - 1, round - 1, []);
        }
      }
      logger.warn("lotto.fetch non-success, using mock", { round });
      return lottoDataSchema.parse(buildMockLotto(round, latest));
    }
    // topStore는 EUC-KR HTML 스크래핑이라 안정성 위해 우선 제외 (빈 배열).
    // LottoDetail에서 비어 있으면 동행복권 배출점 페이지 외부 링크로 안내.
    return normalize(raw, round, latest, []);
  } catch (err) {
    logger.warn("lotto.fetch failed (해외 IP 차단 가능), using mock", {
      round,
      error: err instanceof Error ? err.message : String(err),
    });
    return lottoDataSchema.parse(buildMockLotto(round, latest));
  }
}

async function fetchDraw(round: number, abort: AbortSignal): Promise<RawDraw | null> {
  const url = `${LOTTO_NUMBER_BASE}?method=getLottoNumber&drwNo=${round}`;
  const res = await fetch(url, { signal: abort, headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  // 봇 차단 시 JSON 대신 HTML(메인 리다이렉트)이 옴 — JSON 파싱 실패하면 null.
  try {
    return JSON.parse(text) as RawDraw;
  } catch {
    return null;
  }
}

function normalize(
  raw: RawDraw,
  round: number,
  latest: number,
  topStores: TopStore[],
): LottoData {
  const numbers = [
    raw.drwtNo1,
    raw.drwtNo2,
    raw.drwtNo3,
    raw.drwtNo4,
    raw.drwtNo5,
    raw.drwtNo6,
  ].filter((n): n is number => typeof n === "number");

  if (numbers.length !== 6 || typeof raw.bnusNo !== "number") {
    return lottoDataSchema.parse(buildMockLotto(round, latest));
  }

  return lottoDataSchema.parse({
    round: raw.drwNo ?? round,
    drawDate: raw.drwNoDate ?? "",
    numbers: numbers.sort((a, b) => a - b),
    bonus: raw.bnusNo,
    firstPrizeAmount: typeof raw.firstWinamnt === "number" ? raw.firstWinamnt : null,
    firstPrizeWinners: typeof raw.firstPrzwnerCo === "number" ? raw.firstPrzwnerCo : null,
    topStores,
    latestRound: latest,
    source: "live",
  });
}
