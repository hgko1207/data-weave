import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import {
  RentFilters,
  type RentSort,
  type RentTypeFilter,
} from "@/components/widget/rent/RentFilters";
import { RentDetail } from "@/components/widget/rent/RentDetail";
import { RentTrendChart } from "@/components/widget/rent/RentTrendChart";
import {
  fetchRent,
  fetchRentMonthlyTrend,
  type RentMonthlyTrendPoint,
} from "@/widgets/rent/fetch";
import { currentKstYmExport, formatYm } from "@/widgets/apartment/fetch";
import { findLawdCode, LAWD_BY_SIDO } from "@/widgets/apartment/lawd-codes";
import { rentDataSchema, type RentData } from "@/widgets/rent/schema";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const DEFAULT_SIDO = "대전광역시";
const DEFAULT_SIGUNGU = "유성구";
const ALLOWED_TYPES = new Set<RentTypeFilter>(["all", "jeonse", "monthly"]);
const ALLOWED_SORTS = new Set<RentSort>([
  "date-desc",
  "deposit-desc",
  "deposit-asc",
  "rent-desc",
  "area-desc",
]);

type Props = {
  searchParams: Promise<{
    sido?: string;
    sigungu?: string;
    lawdCd?: string;
    dealYm?: string;
    type?: string;
    sort?: string;
    q?: string;
  }>;
};

export default async function RentDetailPage({ searchParams }: Props) {
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
  const dealYm =
    params.dealYm && /^\d{6}$/.test(params.dealYm) ? params.dealYm : currentKstYmExport();
  const typeRaw = (params.type ?? "all") as RentTypeFilter;
  const type: RentTypeFilter = ALLOWED_TYPES.has(typeRaw) ? typeRaw : "all";
  const sortRaw = (params.sort ?? "date-desc") as RentSort;
  const sort: RentSort = ALLOWED_SORTS.has(sortRaw) ? sortRaw : "date-desc";
  const q = (params.q ?? "").slice(0, 60);

  const now = new Date();
  const abort = new AbortController().signal;
  const serviceKey = process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_KEY || "";

  let data: RentData;
  let trend: RentMonthlyTrendPoint[] = [];
  let errorMessage: string | undefined;
  try {
    const [d, t] = await Promise.all([
      fetchRent({
        config: { v: 1, sido, sigungu, lawdCd, dealYm },
        abort,
        now,
      }),
      serviceKey
        ? fetchRentMonthlyTrend(serviceKey, lawdCd, 6, now, abort).catch(() => [])
        : Promise.resolve([] as RentMonthlyTrendPoint[]),
    ]);
    data = d;
    trend = t;
  } catch (err) {
    logger.warn("rent detail page fetch failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
    data = rentDataSchema.parse({
      region: `${sido} ${sigungu}`,
      dealYm,
      trades: [],
      totalCount: 0,
      jeonseCount: 0,
      monthlyCount: 0,
      avgJeonseDeposit: null,
      avgMonthlyDeposit: null,
      avgMonthlyRent: null,
      source: "mock",
    });
  }

  return (
    <PageFrame
      eyebrow="widget · rent"
      title={`전월세 실거래가 · ${sido} ${sigungu}`}
      description="국토교통부 전월세 실거래가. 시·군·구 + 월 단위 거래 + 전세/월세 필터 + 정렬."
      actions={
        <>
          <BookmarkButton
            label={`전월세 · ${sido} ${sigungu} · ${formatYm(dealYm)}`}
            widgetId="rent"
          />
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
      <RentFilters current={{ sido, sigungu, lawdCd, dealYm, type, sort, q }} />

      {errorMessage ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200">
          데이터를 불러오지 못했습니다: <span className="font-mono">{errorMessage}</span>
        </div>
      ) : null}

      {trend.length > 0 ? (
        <RentTrendChart points={trend} region={`${sido} ${sigungu}`} />
      ) : null}

      <RentDetail
        data={data}
        typeFilter={type}
        sort={sort}
        query={q}
        context={{ sido, sigungu, lawdCd }}
      />
    </PageFrame>
  );
}
