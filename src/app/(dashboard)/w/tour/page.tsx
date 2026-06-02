import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import { DataSourceNotice } from "@/components/widget/DataSourceNotice";
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
  // 빈 값 = '전체'(시·도 전체). 유효한 시·군·구면 그것, 아니면 '전체'.
  const sigungu = requestedSigungu && sigunguMap[requestedSigungu] ? requestedSigungu : "";
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

  const regionLabel = sigungu ? `${sido} ${sigungu}` : `${sido} 전체`;
  return (
    <PageFrame
      eyebrow="widget · tour"
      title={`관광·전시 · ${regionLabel}`}
      description="한국관광공사 TourAPI 기반. 자연·문화·축제·레저·쇼핑 카테고리로 지역 명소 둘러보기."
      actions={
        <>
          <BookmarkButton
            label={`관광 · ${regionLabel}${category !== "all" ? ` · ${category}` : ""}`}
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

      <DataSourceNotice errorMessage={errorMessage} source={data.source} />

      <TourDetail data={data} />
    </PageFrame>
  );
}
