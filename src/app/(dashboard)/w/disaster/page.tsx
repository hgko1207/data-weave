import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import { DataSourceNotice } from "@/components/widget/DataSourceNotice";
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
  // '전국'은 가상 옵션 — LAWD 매핑 없음, 지역 필터 안 함.
  const isNationwide = params.sido === "전국";
  const sido = isNationwide
    ? "전국"
    : params.sido && LAWD_BY_SIDO[params.sido]
    ? params.sido
    : DEFAULT_SIDO;
  let sigungu = "";
  if (!isNationwide) {
    const sigunguMap = LAWD_BY_SIDO[sido];
    const requestedSigungu = params.sigungu ?? "";
    // 빈 값 = '전체'(시·도 전체). 유효한 시·군·구면 그것, 아니면 '전체'.
    sigungu = requestedSigungu && sigunguMap[requestedSigungu] ? requestedSigungu : "";
  }
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
    const region = isNationwide ? "전국" : sigungu ? `${sido} ${sigungu}` : `${sido} 전체`;
    data = disasterDataSchema.parse({
      region,
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
      title={`재난문자 · ${isNationwide ? "전국" : sigungu ? `${sido} ${sigungu}` : `${sido} 전체`}`}
      description="행정안전부 긴급재난문자. 지역·긴급단계·기간별로 최근 발송 내역을 타임라인으로."
      actions={
        <>
          <BookmarkButton
            label={`재난문자 · ${isNationwide ? "전국" : sigungu ? `${sido} ${sigungu}` : `${sido} 전체`}`}
            widgetId="disaster"
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
      <DisasterFilters current={{ sido, sigungu, level, windowHours }} />

      <DataSourceNotice errorMessage={errorMessage} source={data.source} />

      <DisasterDetail data={data} />
    </PageFrame>
  );
}
