import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import {
  DisasterFilters,
  type DisasterLevel,
} from "@/components/widget/disaster/DisasterFilters";
import { DisasterDetail } from "@/components/widget/disaster/DisasterDetail";
import { fetchDisaster } from "@/widgets/disaster/fetch";
import { LAWD_BY_SIDO } from "@/widgets/apartment/lawd-codes";
import { disasterDataSchema, type DisasterData } from "@/widgets/disaster/schema";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const DEFAULT_SIDO = "대전광역시";
const DEFAULT_SIGUNGU = "유성구";
const ALLOWED_LEVELS = new Set<DisasterLevel>(["all", "critical", "emergency", "info"]);
const ALLOWED_WINDOWS = new Set([24, 72, 168]);

type Props = {
  searchParams: Promise<{
    sido?: string;
    sigungu?: string;
    level?: string;
    window?: string;
  }>;
};

export default async function DisasterPage({ searchParams }: Props) {
  const params = await searchParams;
  const sido = params.sido && LAWD_BY_SIDO[params.sido] ? params.sido : DEFAULT_SIDO;
  const sigunguMap = LAWD_BY_SIDO[sido];
  const requestedSigungu = params.sigungu ?? "";
  const sigungu = sigunguMap[requestedSigungu]
    ? requestedSigungu
    : sido === DEFAULT_SIDO
    ? DEFAULT_SIGUNGU
    : Object.keys(sigunguMap)[0];
  const levelRaw = (params.level ?? "all") as DisasterLevel;
  const level: DisasterLevel = ALLOWED_LEVELS.has(levelRaw) ? levelRaw : "all";
  const windowNum = params.window ? Number(params.window) : 72;
  const windowHours = ALLOWED_WINDOWS.has(windowNum) ? windowNum : 72;

  let data: DisasterData;
  let errorMessage: string | undefined;
  try {
    data = await fetchDisaster({
      config: { v: 1, sido, sigungu, level, windowHours },
      abort: new AbortController().signal,
      now: new Date(),
    });
  } catch (err) {
    logger.warn("disaster page fetch failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
    data = disasterDataSchema.parse({
      region: `${sido} ${sigungu}`,
      windowHours,
      level,
      messages: [],
      total: 0,
      source: "mock",
    });
  }

  return (
    <PageFrame
      eyebrow="widget · disaster"
      title={`재난문자 · ${sido} ${sigungu}`}
      description="행정안전부 긴급재난문자. 지역·긴급단계·기간별로 최근 발송 내역을 타임라인으로."
      actions={
        <>
          <BookmarkButton label={`재난문자 · ${sido} ${sigungu}`} widgetId="disaster" />
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
      <DisasterFilters current={{ sido, sigungu, level, windowHours }} />

      {errorMessage ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200">
          데이터를 불러오지 못했습니다: <span className="font-mono">{errorMessage}</span>
        </div>
      ) : null}

      <DisasterDetail data={data} />
    </PageFrame>
  );
}
