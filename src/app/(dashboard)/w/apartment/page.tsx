import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { ApartmentFilters } from "@/components/widget/apartment/ApartmentFilters";
import { ApartmentDetail } from "@/components/widget/apartment/ApartmentDetail";
import { fetchApartment, fetchMonthlyTrend, currentKstYmExport, type MonthlyTrendPoint } from "@/widgets/apartment/fetch";
import { ApartmentTrendChart } from "@/components/widget/apartment/ApartmentTrendChart";
import { findLawdCode, LAWD_BY_SIDO } from "@/widgets/apartment/lawd-codes";
import {
  apartmentDataSchema,
  type ApartmentData,
} from "@/widgets/apartment/schema";
import type { ApartmentSort } from "@/components/widget/apartment/ApartmentFilters";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const DEFAULT_SIDO = "대전광역시";
const DEFAULT_SIGUNGU = "유성구";
const ALLOWED_SORTS = new Set<ApartmentSort>([
  "date-desc",
  "amount-desc",
  "amount-asc",
  "area-desc",
  "pyeong-desc",
]);

type Props = {
  searchParams: Promise<{
    sido?: string;
    sigungu?: string;
    lawdCd?: string;
    dealYm?: string;
    sort?: string;
  }>;
};

export default async function ApartmentDetailPage({ searchParams }: Props) {
  const params = await searchParams;
  const sido = params.sido && LAWD_BY_SIDO[params.sido] ? params.sido : DEFAULT_SIDO;
  const sigunguMap = LAWD_BY_SIDO[sido];
  const requestedSigungu = params.sigungu ?? "";
  const sigungu = sigunguMap[requestedSigungu]
    ? requestedSigungu
    : sido === DEFAULT_SIDO
    ? DEFAULT_SIGUNGU
    : Object.keys(sigunguMap)[0];
  const lawdCd =
    params.lawdCd && /^\d{5}$/.test(params.lawdCd)
      ? params.lawdCd
      : findLawdCode(sido, sigungu) ?? "30200";
  const dealYm = params.dealYm && /^\d{6}$/.test(params.dealYm)
    ? params.dealYm
    : currentKstYmExport();
  const sortRaw = (params.sort ?? "date-desc") as ApartmentSort;
  const sort: ApartmentSort = ALLOWED_SORTS.has(sortRaw) ? sortRaw : "date-desc";

  const now = new Date();
  const abort = new AbortController().signal;
  const serviceKey = process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_KEY || "";

  let data: ApartmentData;
  let trend: MonthlyTrendPoint[] = [];
  let errorMessage: string | undefined;
  try {
    const [d, t] = await Promise.all([
      fetchApartment({
        config: { v: 1, sido, sigungu, lawdCd, dealYm },
        abort,
        now,
      }),
      serviceKey
        ? fetchMonthlyTrend(serviceKey, lawdCd, 6, now, abort).catch(() => [])
        : Promise.resolve([] as MonthlyTrendPoint[]),
    ]);
    data = d;
    trend = t;
  } catch (err) {
    logger.warn("apartment detail page fetch failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
    data = apartmentDataSchema.parse({
      region: `${sido} ${sigungu}`,
      dealYm,
      trades: [],
      totalCount: 0,
      avgAmount: null,
      medianAmount: null,
      minAmount: null,
      maxAmount: null,
      source: "mock",
    });
  }

  return (
    <PageFrame
      eyebrow="widget · apartment"
      title={`아파트 실거래가 · ${sido} ${sigungu}`}
      description="국토교통부 매매 실거래가 자료. 시·군·구별 월 단위 거래 내역과 가격 통계."
      actions={
        <Link
          href="/"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          대시보드
        </Link>
      }
    >
      <ApartmentFilters current={{ sido, sigungu, lawdCd, dealYm, sort }} />

      {errorMessage ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200">
          데이터를 불러오지 못했습니다: <span className="font-mono">{errorMessage}</span>
        </div>
      ) : null}

      {trend.length > 0 ? (
        <ApartmentTrendChart points={trend} region={`${sido} ${sigungu}`} />
      ) : null}

      <ApartmentDetail data={data} sort={sort} />
    </PageFrame>
  );
}
