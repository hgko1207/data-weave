import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import { LottoDetail } from "@/components/widget/lotto/LottoDetail";
import { LottoStats } from "@/components/widget/lotto/LottoStats";
import { LottoTools } from "@/components/widget/lotto/LottoTools";
import { fetchLotto, fetchLottoStats, type LottoStats as Stats } from "@/widgets/lotto/fetch";
import { lottoDataSchema, type LottoData } from "@/widgets/lotto/schema";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const STATS_SAMPLE = 30; // 최근 30회 통계

type Props = {
  searchParams: Promise<{
    round?: string;
  }>;
};

export default async function LottoPage({ searchParams }: Props) {
  const params = await searchParams;
  const roundNum = params.round ? Number(params.round) : null;
  const round = Number.isFinite(roundNum) && roundNum && roundNum > 0 ? roundNum : null;

  const now = new Date();
  const abort = new AbortController().signal;

  let data: LottoData;
  let stats: Stats | null = null;
  let errorMessage: string | undefined;
  try {
    data = await fetchLotto({ config: { v: 1, round }, abort, now });
    stats = await fetchLottoStats(data.latestRound, STATS_SAMPLE, now, abort).catch(() => null);
  } catch (err) {
    logger.warn("lotto page fetch failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
    data = lottoDataSchema.parse({
      round: 1,
      drawDate: "2002-12-07",
      numbers: [1, 2, 3, 4, 5, 6],
      bonus: 7,
      firstPrizeAmount: null,
      firstPrizeWinners: null,
      topStores: [],
      latestRound: 1,
      source: "mock",
    });
  }

  return (
    <PageFrame
      eyebrow="widget · lotto"
      title="로또 6/45"
      description="회차별 당첨번호와 1등 배출점. 매주 토요일 오후 8시 35분 추첨."
      actions={
        <>
          <BookmarkButton label={`로또 · ${data.round}회`} widgetId="lotto" />
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            대시보드
          </Link>
        </>
      }
    >
      {errorMessage ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200">
          데이터를 불러오지 못했습니다: <span className="font-mono">{errorMessage}</span>
        </div>
      ) : null}

      <LottoDetail data={data} />

      <LottoTools round={data.round} winNumbers={data.numbers} bonus={data.bonus} />

      {stats ? <LottoStats stats={stats} /> : null}
    </PageFrame>
  );
}
