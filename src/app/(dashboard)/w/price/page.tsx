import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import { PriceFilters } from "@/components/widget/price/PriceFilters";
import { PriceDetail } from "@/components/widget/price/PriceDetail";
import { fetchPrice } from "@/widgets/price/fetch";
import { CATEGORY_LABEL } from "@/widgets/price/catalog";
import {
  PRICE_CATEGORIES,
  PRICE_CLS,
  priceDataSchema,
  type PriceCategory,
  type PriceCls,
  type PriceData,
} from "@/widgets/price/schema";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const ALLOWED_CATS = new Set<PriceCategory>(PRICE_CATEGORIES);
const ALLOWED_CLS = new Set<PriceCls>(PRICE_CLS);

type Props = {
  searchParams: Promise<{
    category?: string;
    cls?: string;
  }>;
};

export default async function PricePage({ searchParams }: Props) {
  const params = await searchParams;
  const catRaw = (params.category ?? "vegetable") as PriceCategory;
  const category: PriceCategory = ALLOWED_CATS.has(catRaw) ? catRaw : "vegetable";
  const clsRaw = (params.cls ?? "retail") as PriceCls;
  const cls: PriceCls = ALLOWED_CLS.has(clsRaw) ? clsRaw : "retail";

  let data: PriceData;
  let errorMessage: string | undefined;
  try {
    data = await fetchPrice({
      config: { v: 1, category, cls },
      abort: new AbortController().signal,
      now: new Date(),
    });
  } catch (err) {
    logger.warn("price page fetch failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
    data = priceDataSchema.parse({
      category,
      cls,
      regday: "",
      items: [],
      source: "mock",
    });
  }

  return (
    <PageFrame
      eyebrow="widget · price"
      title="농수산물 시세"
      description="농산물유통정보(KAMIS) 부류별 일일 도소매 가격. 당일가 + 전일·1주일 대비 변동."
      actions={
        <>
          <BookmarkButton
            label={`시세 · ${CATEGORY_LABEL[category]} ${cls === "wholesale" ? "도매" : "소매"}`}
            widgetId="price"
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
      <PriceFilters current={{ category, cls }} />

      {errorMessage ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200">
          데이터를 불러오지 못했습니다: <span className="font-mono">{errorMessage}</span>
        </div>
      ) : null}

      <PriceDetail data={data} />
    </PageFrame>
  );
}
