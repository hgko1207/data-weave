import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import { DataSourceNotice } from "@/components/widget/DataSourceNotice";
import { FoodRecallFilters } from "@/components/widget/food-recall/FoodRecallFilters";
import { FoodRecallDetail } from "@/components/widget/food-recall/FoodRecallDetail";
import { fetchFoodRecall } from "@/widgets/food-recall/fetch";
import {
  foodRecallDataSchema,
  type FoodRecallData,
} from "@/widgets/food-recall/schema";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const ALLOWED_WINDOWS = new Set([24, 72, 168, 720]);

type Props = {
  searchParams: Promise<{
    q?: string;
    window?: string;
    grade?: string;
  }>;
};

export default async function FoodRecallDetailPage({ searchParams }: Props) {
  const params = await searchParams;
  const keywords = (params.q ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const windowNum = Number(params.window);
  const windowHours = ALLOWED_WINDOWS.has(windowNum) ? windowNum : 168;
  const grade: "all" | "1" | "2" | "3" =
    params.grade === "1" || params.grade === "2" || params.grade === "3"
      ? params.grade
      : "all";

  let data: FoodRecallData;
  let errorMessage: string | undefined;
  try {
    data = await fetchFoodRecall({
      config: {
        v: 1,
        allergyKeywords: keywords,
        windowHours,
      },
      abort: new AbortController().signal,
      now: new Date(),
    });
  } catch (err) {
    logger.warn("food-recall detail page fetch failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
    data = foodRecallDataSchema.parse({
      total: 0,
      filteredTotal: 0,
      items: [],
      windowHours,
      matchedKeywords: [],
      source: "mock",
    });
  }

  return (
    <PageFrame
      eyebrow="widget · food-recall"
      title="식품 리콜"
      description="식약처 회수·판매중지 정보. 알레르기 키워드와 기간으로 필터링합니다."
      actions={
        <>
          <BookmarkButton
            label={`리콜 · ${keywords.length > 0 ? keywords.join(",") : "전체"} · ${windowHours}h${grade !== "all" ? ` · ${grade}등급` : ""}`}
            widgetId="food-recall"
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
      <FoodRecallFilters current={{ keywords, windowHours, grade }} />

      <DataSourceNotice errorMessage={errorMessage} source={data.source} />

      <FoodRecallDetail data={data} gradeFilter={grade} />
    </PageFrame>
  );
}
