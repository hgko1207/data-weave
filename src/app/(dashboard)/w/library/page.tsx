import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import { LibraryFilters, type LibraryMode } from "@/components/widget/library/LibraryFilters";
import { LibraryDetail } from "@/components/widget/library/LibraryDetail";
import { fetchLibrary } from "@/widgets/library/fetch";
import { LAWD_BY_SIDO } from "@/widgets/apartment/lawd-codes";
import { libraryDataSchema, type LibraryData } from "@/widgets/library/schema";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const DEFAULT_SIDO = "대전광역시";
const DEFAULT_SIGUNGU = "유성구";
const ALLOWED_MODES = new Set<LibraryMode>(["location", "book"]);

type Props = {
  searchParams: Promise<{
    sido?: string;
    sigungu?: string;
    mode?: string;
    q?: string;
    isbn?: string;
  }>;
};

export default async function LibraryDetailPage({ searchParams }: Props) {
  const params = await searchParams;
  const sido = params.sido && LAWD_BY_SIDO[params.sido] ? params.sido : DEFAULT_SIDO;
  const sigunguMap = LAWD_BY_SIDO[sido];
  const requestedSigungu = params.sigungu ?? "";
  const sigungu = sigunguMap[requestedSigungu]
    ? requestedSigungu
    : sido === DEFAULT_SIDO
    ? DEFAULT_SIGUNGU
    : Object.keys(sigunguMap)[0];
  const modeRaw = (params.mode ?? "location") as LibraryMode;
  const mode: LibraryMode = ALLOWED_MODES.has(modeRaw) ? modeRaw : "location";
  const q = (params.q ?? "").slice(0, 60);
  const isbn = (params.isbn ?? "").slice(0, 20);

  let data: LibraryData;
  let errorMessage: string | undefined;
  try {
    data = await fetchLibrary({
      config: { v: 1, sido, sigungu, mode, q, isbn },
      abort: new AbortController().signal,
      now: new Date(),
    });
  } catch (err) {
    logger.warn("library detail page fetch failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
    data = libraryDataSchema.parse({
      region: `${sido} ${sigungu}`,
      mode,
      query: q,
      libraries: [],
      total: 0,
      books: [],
      matchedBook: null,
      source: "mock",
    });
  }

  const bookmarkLabel =
    mode === "book" && q
      ? `도서관 · ${sido} ${sigungu} · "${q}"`
      : `도서관 · ${sido} ${sigungu}`;

  return (
    <PageFrame
      eyebrow="widget · library"
      title={`공공도서관 · ${sido} ${sigungu}`}
      description="전국 공공도서관 위치·운영시간 + 도서명으로 보유 도서관 검색."
      actions={
        <>
          <BookmarkButton label={bookmarkLabel} widgetId="library" />
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
      <LibraryFilters current={{ sido, sigungu, mode, q }} />

      {errorMessage ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200">
          데이터를 불러오지 못했습니다: <span className="font-mono">{errorMessage}</span>
        </div>
      ) : null}

      <LibraryDetail data={data} ctx={{ sido, sigungu, q }} />
    </PageFrame>
  );
}
