import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import { BuildingDetail } from "@/components/widget/apartment/BuildingDetail";
import { fetchBuilding } from "@/widgets/apartment/fetch";
import { findLawdCode, LAWD_BY_SIDO } from "@/widgets/apartment/lawd-codes";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const DEFAULT_SIDO = "대전광역시";
const DEFAULT_SIGUNGU = "유성구";
const MONTHS = 6;

type Props = {
  searchParams: Promise<{
    sido?: string;
    sigungu?: string;
    lawdCd?: string;
    apt?: string;
    dong?: string;
  }>;
};

export default async function BuildingDetailPage({ searchParams }: Props) {
  const params = await searchParams;
  const sido = params.sido && LAWD_BY_SIDO[params.sido] ? params.sido : DEFAULT_SIDO;
  const sigunguMap = LAWD_BY_SIDO[sido];
  const sigungu = params.sigungu && sigunguMap[params.sigungu]
    ? params.sigungu
    : sido === DEFAULT_SIDO
    ? DEFAULT_SIGUNGU
    : Object.keys(sigunguMap)[0];
  const lawdCd =
    params.lawdCd && /^\d{5}$/.test(params.lawdCd)
      ? params.lawdCd
      : findLawdCode(sido, sigungu) ?? "30200";
  const aptName = (params.apt ?? "").slice(0, 60);
  const dong = (params.dong ?? "").slice(0, 30);
  const region = `${sido} ${sigungu}`;

  // 백 링크에 사용 — 단지 페이지에서 시·군·구 목록으로 돌아가기
  const backHref = `/w/apartment?sido=${encodeURIComponent(sido)}&sigungu=${encodeURIComponent(sigungu)}&lawdCd=${lawdCd}`;

  if (!aptName || !dong) {
    return (
      <PageFrame
        eyebrow="widget · apartment"
        title="단지 정보를 찾을 수 없어요"
        description="아파트명과 법정동이 필요합니다."
        actions={
          <Link
            href={backHref}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            거래 목록
          </Link>
        }
      >
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200">
          잘못된 진입 경로입니다. 거래 목록에서 아파트명을 다시 클릭해주세요.
        </div>
      </PageFrame>
    );
  }

  const now = new Date();
  const abort = new AbortController().signal;
  let result;
  try {
    result = await fetchBuilding({ lawdCd, aptName, dong, region }, MONTHS, now, abort);
  } catch (err) {
    logger.warn("building detail fetch failed", {
      aptName,
      dong,
      lawdCd,
      error: err instanceof Error ? err.message : String(err),
    });
    result = {
      aptName,
      dong,
      trades: [],
      source: "mock" as const,
      monthsScanned: MONTHS,
    };
  }

  return (
    <PageFrame
      eyebrow="widget · apartment · building"
      title={aptName}
      description={`${region} ${dong} · 최근 ${MONTHS}개월 거래 집계`}
      actions={
        <>
          <BookmarkButton
            label={`단지 · ${aptName} (${region} ${dong})`}
            widgetId="apartment"
          />
          <Link
            href={backHref}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            거래 목록
          </Link>
        </>
      }
    >
      <BuildingDetail
        aptName={aptName}
        dong={dong}
        region={region}
        trades={result.trades}
        monthsScanned={result.monthsScanned}
        source={result.source}
      />
    </PageFrame>
  );
}
