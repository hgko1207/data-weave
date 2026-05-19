import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import { TourFilters } from "@/components/widget/tour/TourFilters";
import { TourDetail } from "@/components/widget/tour/TourDetail";
import { fetchTour } from "@/widgets/tour/fetch";
import { LAWD_BY_SIDO } from "@/widgets/apartment/lawd-codes";
import { tourDataSchema, type TourData, type TourCategory } from "@/widgets/tour/schema";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const DEFAULT_SIDO = "대전광역시";
const DEFAULT_SIGUNGU = "유성구";
const ALLOWED_CATS = new Set<TourCategory>([
  "all",
  "nature",
  "culture",
  "festival",
  "leisure",
  "shopping",
]);

type Props = {
  searchParams: Promise<{
    sido?: string;
    sigungu?: string;
    category?: string;
  }>;
};

export default async function TourDetailPage({ searchParams }: Props) {
  const params = await searchParams;
  const sido = params.sido && LAWD_BY_SIDO[params.sido] ? params.sido : DEFAULT_SIDO;
  const sigunguMap = LAWD_BY_SIDO[sido];
  const requestedSigungu = params.sigungu ?? "";
  const sigungu = sigunguMap[requestedSigungu]
    ? requestedSigungu
    : sido === DEFAULT_SIDO
    ? DEFAULT_SIGUNGU
    : Object.keys(sigunguMap)[0];
  const catRaw = (params.category ?? "all") as TourCategory;
  const category: TourCategory = ALLOWED_CATS.has(catRaw) ? catRaw : "all";

  let data: TourData;
  let errorMessage: string | undefined;
  try {
    data = await fetchTour({
      config: { v: 1, sido, sigungu, category },
      abort: new AbortController().signal,
      now: new Date(),
    });
  } catch (err) {
    logger.warn("tour detail page fetch failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
    data = tourDataSchema.parse({
      region: `${sido} ${sigungu}`,
      category,
      items: [],
      total: 0,
      source: "mock",
    });
  }

  return (
    <PageFrame
      eyebrow="widget · tour"
      title={`관광·전시 · ${sido} ${sigungu}`}
      description="한국관광공사 TourAPI 기반. 자연·문화·축제·레저·쇼핑 카테고리로 지역 명소 둘러보기."
      actions={
        <>
          <BookmarkButton
            label={`관광 · ${sido} ${sigungu}${category !== "all" ? ` · ${category}` : ""}`}
            widgetId="tour"
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
      <TourFilters current={{ sido, sigungu, category }} />

      {errorMessage ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200">
          데이터를 불러오지 못했습니다: <span className="font-mono">{errorMessage}</span>
        </div>
      ) : null}

      <TourDetail data={data} />
    </PageFrame>
  );
}
