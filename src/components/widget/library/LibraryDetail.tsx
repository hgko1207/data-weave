import {
  BookOpen,
  Building2,
  Clock,
  ExternalLink,
  Library as LibraryIcon,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import type { Library, LibraryData } from "@/widgets/library/schema";

type Props = {
  data: LibraryData;
};

export function LibraryDetail({ data }: Props) {
  const isBookMode = data.mode === "book";
  const hasQuery = data.query.trim().length > 0;

  return (
    <div className="space-y-5">
      {isBookMode && hasQuery && data.matchedBook ? (
        <MatchedBookCard book={data.matchedBook} />
      ) : null}

      <StatsRow data={data} />

      <LibraryList data={data} />

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function MatchedBookCard({
  book,
}: {
  book: NonNullable<LibraryData["matchedBook"]>;
}) {
  return (
    <article className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
          <BookOpen className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-emerald-300">
            매칭 도서
          </p>
          <h2 className="mt-1 text-base font-semibold text-zinc-100">{book.title}</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {book.author ? `${book.author}` : ""}
            {book.publisher ? ` · ${book.publisher}` : ""}
            {book.isbn ? (
              <>
                {" · "}
                <span className="font-mono text-xs text-zinc-500">ISBN {book.isbn}</span>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </article>
  );
}

function StatsRow({ data }: { data: LibraryData }) {
  const isBookMode = data.mode === "book";
  const holdsCount = isBookMode
    ? data.libraries.filter((l) => l.holdsBook).length
    : data.total;
  const availableCount = isBookMode
    ? data.libraries.filter((l) => l.bookAvailable).length
    : data.libraries.filter((l) => (l.bookCount ?? 0) > 30000).length;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <StatCard
        icon={<LibraryIcon className="h-4 w-4" aria-hidden />}
        label={isBookMode ? "보유 도서관" : "검색 결과"}
        value={`${holdsCount}곳`}
        accent="bg-emerald-500/15 text-emerald-400"
        valueClass="text-emerald-200"
      />
      <StatCard
        icon={<BookOpen className="h-4 w-4" aria-hidden />}
        label={isBookMode ? "지금 대출 가능" : "장서 3만권 이상"}
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
  const mapHref = `https://map.kakao.com/?q=${encodeURIComponent(`${lib.name} ${lib.address}`)}`;
  return (
    <li
      className={`grid grid-cols-[40px_1fr_auto] items-start gap-4 px-6 py-4 transition hover:bg-zinc-800/40 md:grid-cols-[40px_1fr_180px_120px]`}
    >
      <span className="text-right font-mono text-xs tabular-nums text-zinc-600">
        {String(index).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h3 className="text-base font-medium text-zinc-100">{lib.name}</h3>
          {isBookMode ? (
            lib.holdsBook ? (
              lib.bookAvailable ? (
                <span className="inline-flex items-center rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-300">
                  대출 가능
                </span>
              ) : (
                <span className="inline-flex items-center rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-300">
                  대출 중
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500">
                <XCircle className="h-3 w-3" aria-hidden />
                미소장
              </span>
            )
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-500">{lib.address}</p>
        {/* 모바일: 운영시간 + 휴관일 인라인 */}
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs text-zinc-500 md:hidden">
          {lib.openHours ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {lib.openHours}
            </span>
          ) : null}
          {lib.closedDays ? <span className="text-rose-300">· 휴관 {lib.closedDays}</span> : null}
        </p>
      </div>

      {/* 데스크탑: 운영시간 / 휴관 */}
      <div className="hidden flex-col gap-0.5 font-mono text-xs text-zinc-400 md:flex">
        {lib.openHours ? (
          <p className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-zinc-500" aria-hidden />
            {lib.openHours}
          </p>
        ) : null}
        {lib.closedDays ? (
          <p className="text-rose-300">휴관 · {lib.closedDays}</p>
        ) : (
          <p className="text-emerald-300">연중무휴</p>
        )}
        {!isBookMode && lib.bookCount != null ? (
          <p className="text-zinc-500 tabular-nums">장서 {lib.bookCount.toLocaleString()}권</p>
        ) : null}
      </div>

      <div className="col-span-3 mt-1 flex items-center gap-2 md:col-span-1 md:mt-0 md:flex-col md:items-end md:gap-1.5">
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
