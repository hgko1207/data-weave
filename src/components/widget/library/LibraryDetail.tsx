import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  Library as LibraryIcon,
  MapPin,
  Phone,
} from "lucide-react";
// (XCircle 제거 — book mode 미소장 표시 폐기)
import type { Library, LibraryData, MatchedBook } from "@/widgets/library/schema";

type Ctx = { sido: string; sigungu: string; q: string };

type Props = {
  data: LibraryData;
  ctx: Ctx;
};

function buildHref(ctx: Ctx, isbn?: string): string {
  const p = new URLSearchParams({
    sido: ctx.sido,
    sigungu: ctx.sigungu,
    mode: "book",
  });
  if (ctx.q) p.set("q", ctx.q);
  if (isbn) p.set("isbn", isbn);
  return `/w/library?${p.toString()}`;
}

export function LibraryDetail({ data, ctx }: Props) {
  const isBookMode = data.mode === "book";

  // 도서명 검색 모드
  if (isBookMode) {
    // 책 선택됨 → 선택 책 + 소장 도서관
    if (data.matchedBook) {
      return (
        <div className="space-y-5">
          <SelectedBookCard book={data.matchedBook} backHref={buildHref(ctx)} />
          <StatsRow data={data} />
          <LibraryList data={data} />
          <MockNote source={data.source} />
        </div>
      );
    }
    // 검색 결과 도서 목록 (선택 전)
    return (
      <div className="space-y-5">
        <BookGrid books={data.books} query={data.query} ctx={ctx} />
        <MockNote source={data.source} />
      </div>
    );
  }

  // 도서관 위치 모드
  return (
    <div className="space-y-5">
      <StatsRow data={data} />
      <LibraryList data={data} />
      <MockNote source={data.source} />
    </div>
  );
}

function MockNote({ source }: { source: LibraryData["source"] }) {
  if (source !== "mock") return null;
  return (
    <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
      mock · 한국에서 접속 시 정보나루 실 데이터로 전환
    </p>
  );
}

// 검색 결과 도서 목록 — 책 선택 그리드
function BookGrid({ books, query, ctx }: { books: MatchedBook[]; query: string; ctx: Ctx }) {
  if (!query.trim()) {
    return (
      <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-12 text-center">
        <BookOpen className="mx-auto h-7 w-7 text-zinc-500" aria-hidden />
        <p className="mt-3 text-base font-medium text-zinc-100">도서명을 검색해보세요</p>
        <p className="mt-1 text-xs text-zinc-500">
          책 제목을 입력하면 그 책을 소장한 도서관을 찾아드려요.
        </p>
      </article>
    );
  }
  if (books.length === 0) {
    return (
      <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-12 text-center">
        <BookOpen className="mx-auto h-7 w-7 text-zinc-500" aria-hidden />
        <p className="mt-3 text-base font-medium text-zinc-100">
          &ldquo;{query}&rdquo; 검색 결과가 없어요
        </p>
        <p className="mt-1 text-xs text-zinc-500">다른 제목으로 검색해보세요.</p>
      </article>
    );
  }
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
        <h2 className="text-base font-semibold text-zinc-100">
          &ldquo;{query}&rdquo; 검색 결과
        </h2>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          {books.length}권 · 책 선택 시 소장 도서관 조회
        </p>
      </header>
      <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book, i) => (
          <li key={book.isbn ?? i}>
            <Link
              href={buildHref(ctx, book.isbn ?? undefined)}
              className="group flex h-full gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3 transition hover:border-emerald-500/40 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              <span className="flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-900">
                {book.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-zinc-700" aria-hidden />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-medium text-zinc-100 group-hover:text-emerald-200">
                  {book.title}
                </span>
                <span className="mt-1 line-clamp-1 block text-xs text-zinc-500">
                  {book.author ?? ""}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {[book.publisher, book.year].filter(Boolean).join(" · ")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

// 선택된 책 카드 (소장 도서관 조회 대상)
function SelectedBookCard({ book, backHref }: { book: MatchedBook; backHref: string }) {
  return (
    <article className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
      <div className="flex items-start gap-4">
        <span className="flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-900">
          {book.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <BookOpen className="h-6 w-6 text-emerald-400/60" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-emerald-300">
            선택한 도서
          </p>
          <h2 className="mt-1 text-base font-semibold text-zinc-100">{book.title}</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {[book.author, book.publisher, book.year].filter(Boolean).join(" · ")}
          </p>
          {book.isbn ? (
            <p className="mt-0.5 font-mono text-xs text-zinc-500">ISBN {book.isbn}</p>
          ) : null}
          <Link
            href={backHref}
            className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            다른 책 선택
          </Link>
        </div>
      </div>
    </article>
  );
}

function StatsRow({ data }: { data: LibraryData }) {
  const isBookMode = data.mode === "book";

  // book mode: 소장 도서관 + 지금 대출 가능 + 조회 지역.
  if (isBookMode) {
    const availableCount = data.libraries.filter((l) => l.bookAvailable === true).length;
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          icon={<LibraryIcon className="h-4 w-4" aria-hidden />}
          label="소장 도서관"
          value={`${data.libraries.length}곳`}
          accent="bg-emerald-500/15 text-emerald-400"
          valueClass="text-emerald-200"
        />
        <StatCard
          icon={<BookOpen className="h-4 w-4" aria-hidden />}
          label="지금 대출 가능"
          value={`${availableCount}곳`}
          accent="bg-cyan-500/15 text-cyan-400"
          valueClass="text-cyan-200"
        />
        <StatCard
          icon={<Building2 className="h-4 w-4" aria-hidden />}
          label="조회 지역"
          value={data.region}
          accent="bg-zinc-800 text-zinc-300"
        />
      </div>
    );
  }

  // location mode
  const richCount = data.libraries.filter((l) => (l.bookCount ?? 0) > 30000).length;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <StatCard
        icon={<LibraryIcon className="h-4 w-4" aria-hidden />}
        label="검색 결과"
        value={`${data.total}곳`}
        accent="bg-emerald-500/15 text-emerald-400"
        valueClass="text-emerald-200"
      />
      <StatCard
        icon={<BookOpen className="h-4 w-4" aria-hidden />}
        label="장서 3만권 이상"
        value={`${richCount}곳`}
        accent="bg-cyan-500/15 text-cyan-400"
        valueClass="text-cyan-200"
      />
      <StatCard
        icon={<Building2 className="h-4 w-4" aria-hidden />}
        label="조회 지역"
        value={data.region}
        accent="bg-zinc-800 text-zinc-300"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  valueClass?: string;
}) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-4">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className={`flex h-9 w-9 items-center justify-center rounded-md ${accent}`}
        >
          {icon}
        </span>
        <span className="text-sm font-medium text-zinc-300">{label}</span>
      </div>
      <p
        className={`mt-3 font-mono text-2xl font-semibold tracking-tight ${
          valueClass ?? "text-zinc-100"
        }`}
      >
        {value}
      </p>
    </article>
  );
}

function LibraryList({ data }: { data: LibraryData }) {
  if (data.libraries.length === 0) {
    return (
      <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-12 text-center">
        <LibraryIcon className="mx-auto h-7 w-7 text-zinc-500" aria-hidden />
        <p className="mt-3 text-base font-medium text-zinc-100">
          조건에 맞는 도서관이 없어요
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          다른 시·군·구를 선택하거나 검색어를 비워보세요.
        </p>
      </article>
    );
  }

  const isBookMode = data.mode === "book";

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
        <h2 className="text-base font-semibold text-zinc-100">도서관 목록</h2>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          {data.libraries.length}곳
        </p>
      </header>
      <ul className="divide-y divide-zinc-800/60">
        {data.libraries.map((lib, idx) => (
          <LibraryRow key={lib.id} index={idx + 1} lib={lib} isBookMode={isBookMode} />
        ))}
      </ul>
    </article>
  );
}

function LibraryRow({
  index,
  lib,
  isBookMode,
}: {
  index: number;
  lib: Library;
  isBookMode: boolean;
}) {
  const mapHref =
    lib.latitude != null && lib.longitude != null
      ? `https://map.kakao.com/link/map/${encodeURIComponent(lib.name)},${lib.latitude},${lib.longitude}`
      : `https://map.kakao.com/?q=${encodeURIComponent(`${lib.name} ${lib.address}`)}`;
  const hours = summarizeHours(lib.openHours);
  const closed = summarizeClosed(lib.closedDays);
  return (
    <li className="flex flex-col gap-3 px-6 py-4 transition hover:bg-zinc-800/40 md:flex-row md:items-start md:justify-between md:gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-mono text-xs tabular-nums text-zinc-500">
            {String(index).padStart(2, "0")}
          </span>
          <h3 className="text-base font-medium text-zinc-100">{lib.name}</h3>
          {lib.bookCount != null ? (
            <span className="font-mono text-xs tabular-nums text-zinc-500">
              장서 {lib.bookCount.toLocaleString()}권
            </span>
          ) : null}
          {isBookMode && lib.holdsBook ? (
            lib.bookAvailable === true ? (
              <span className="inline-flex items-center rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-300">
                대출 가능
              </span>
            ) : lib.bookAvailable === false ? (
              <span className="inline-flex items-center rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-300">
                대출 중
              </span>
            ) : (
              <span className="inline-flex items-center rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
                소장
              </span>
            )
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-500">{lib.address}</p>
        {/* 운영시간·휴관 요약 한 줄 (전체는 title 툴팁) */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {hours ? (
            <span
              className="inline-flex max-w-full items-center gap-1 text-zinc-400"
              title={lib.openHours ?? undefined}
            >
              <Clock className="h-3 w-3 shrink-0 text-zinc-500" aria-hidden />
              <span className="truncate">{hours}</span>
            </span>
          ) : null}
          {closed ? (
            <span className="text-rose-300" title={lib.closedDays ?? undefined}>
              휴관 {closed}
            </span>
          ) : (
            <span className="text-emerald-300">연중무휴</span>
          )}
        </div>
      </div>

      {/* 액션 — 가로 배치 */}
      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        {lib.tel ? (
          <a
            href={`tel:${lib.tel}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 font-mono text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <Phone className="h-3 w-3" aria-hidden />
            {lib.tel}
          </a>
        ) : null}
        <a
          href={mapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 font-mono text-xs text-emerald-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <MapPin className="h-3 w-3" aria-hidden />
          카카오맵
          <ExternalLink className="h-3 w-3 text-emerald-400" aria-hidden />
        </a>
        {lib.homepage ? (
          <a
            href={lib.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 font-mono text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            홈페이지
            <ExternalLink className="h-3 w-3 text-zinc-500" aria-hidden />
          </a>
        ) : null}
      </div>
    </li>
  );
}

// 정보나루 운영시간은 자료실별로 길게 옴 — 대표 시간 한 토막만 노출 (전체는 title).
function summarizeHours(hours: string | null): string | null {
  if (!hours) return null;
  const cleaned = hours.replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned === "-") return null;
  // 첫 구분(쉼표/슬래시) 앞 또는 28자 제한
  const firstSeg = cleaned.split(/[,/]/)[0].trim();
  const base = firstSeg.length >= 6 ? firstSeg : cleaned;
  return base.length > 30 ? `${base.slice(0, 30)}…` : base;
}

// "매주 월요일 / 국경일, 정부에서..." → "매주 월요일"
function summarizeClosed(closed: string | null): string | null {
  if (!closed) return null;
  const first = closed.split("/")[0].trim();
  return first || null;
}
