import type { WidgetContext } from "../_types";
import {
  libraryConfigSchema,
  libraryDataSchema,
  type Library,
  type LibraryData,
  type MatchedBook,
} from "./schema";
import { buildMockLibrary } from "./mock";
import { SIDO_REGION_CODE } from "./region-codes";
import { logger } from "@/lib/logger";

// 정보나루 (data4library.kr) OpenAPI.
//   도서관 검색: libSrch?authKey&region&format=json
//     → response.libs[].lib = { libCode, libName, address, tel, homepage,
//        operatingTime, closed, BookCount, latitude, longitude }
//   도서 검색: srchBooks?authKey&keyword&format=json
//     → response.docs[].doc = { bookname, authors, publisher, isbn13, ... }
//   소장 도서관: libSrchByBook?authKey&isbn13&region&format=json (libSrch와 동일 구조)
// region(시·도) 코드로 조회 → 시·군·구는 address 매칭으로 client 필터.
const LIB_SRCH_BASE = "https://data4library.kr/api/libSrch";
const SRCH_BOOKS_BASE = "https://data4library.kr/api/srchBooks";
const LIB_BY_BOOK_BASE = "https://data4library.kr/api/libSrchByBook";
const BOOK_EXIST_BASE = "https://data4library.kr/api/bookExist";
// bookExist는 도서관별 호출이라 부담 — 대출가능 표시는 상위 N곳만.
const LOAN_CHECK_LIMIT = 25;

type RawLibEntry = { lib?: RawLib };
type RawLib = {
  libCode?: string | number;
  libName?: string;
  address?: string;
  tel?: string;
  homepage?: string;
  operatingTime?: string;
  closed?: string;
  BookCount?: string | number;
  latitude?: string | number;
  longitude?: string | number;
};

export async function fetchLibrary(ctx: WidgetContext): Promise<LibraryData> {
  const cfg = libraryConfigSchema.parse(ctx.config);
  const key = process.env.LIBRARY_API_KEY || process.env.DATA_GO_KR_KEY;
  const region = `${cfg.sido} ${cfg.sigungu}`;
  const regionCode = SIDO_REGION_CODE[cfg.sido];

  // 도서명 검색 — srchBooks(목록) → 선택 시 libSrchByBook(소장 도서관).
  if (cfg.mode === "book") {
    return fetchByBook(
      cfg.sido,
      cfg.sigungu,
      cfg.q,
      cfg.isbn,
      key,
      regionCode,
      region,
      ctx.abort,
    );
  }

  if (!key || !regionCode) {
    logger.info("library.fetch fallback to mock", {
      reason: !key ? "no LIBRARY/DATA_GO_KR key" : "no region code",
    });
    return libraryDataSchema.parse(buildMockLibrary(cfg.sido, cfg.sigungu, cfg.mode, cfg.q));
  }

  try {
    const params = new URLSearchParams({
      authKey: key,
      region: regionCode,
      pageSize: "100",
      format: "json",
    });
    const res = await fetch(`${LIB_SRCH_BASE}?${params.toString()}`, { signal: ctx.abort });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const parsed = JSON.parse(text) as { response?: { libs?: RawLibEntry[] } };
    const entries = parsed.response?.libs ?? [];

    let libraries = entries
      .map((e) => normalize(e.lib))
      .filter((l): l is Library => l !== null);

    // 시·군·구 필터 — 정보나루는 시·도 단위 조회라 address로 좁힘.
    if (cfg.sigungu) {
      const sgu = cfg.sigungu;
      const matched = libraries.filter((l) => l.address.includes(sgu));
      // 시·군·구 매칭 결과가 있으면 그것만, 없으면 전체(시·도) 유지.
      if (matched.length > 0) libraries = matched;
    }
    // 키워드 필터 (도서관명·주소)
    const q = cfg.q.trim();
    if (q) {
      libraries = libraries.filter(
        (l) => l.name.includes(q) || l.address.includes(q),
      );
    }

    if (libraries.length === 0) {
      // 빈 결과 — live 호출 성공이지만 매칭 0건. mock 대신 빈 데이터.
      return libraryDataSchema.parse({
        region,
        mode: cfg.mode,
        query: cfg.q,
        libraries: [],
        total: 0,
        books: [],
        matchedBook: null,
        source: "live",
      });
    }

    return libraryDataSchema.parse({
      region,
      mode: cfg.mode,
      query: cfg.q,
      libraries: libraries.slice(0, 50),
      total: libraries.length,
      books: [],
      matchedBook: null,
      source: "live",
    });
  } catch (err) {
    logger.warn("library.fetch failed, using mock", {
      sido: cfg.sido,
      error: err instanceof Error ? err.message : String(err),
    });
    return libraryDataSchema.parse(buildMockLibrary(cfg.sido, cfg.sigungu, cfg.mode, cfg.q));
  }
}

type RawBookEntry = { doc?: RawBook };
type RawBook = {
  bookname?: string;
  authors?: string;
  publisher?: string;
  isbn13?: string | number;
  publication_year?: string | number;
  bookImageURL?: string;
};

// 도서명 검색: srchBooks(목록) → isbn 선택 시 libSrchByBook(소장 도서관).
async function fetchByBook(
  sido: string,
  sigungu: string,
  q: string,
  isbn: string,
  key: string | undefined,
  regionCode: string | undefined,
  region: string,
  abort: AbortSignal,
): Promise<LibraryData> {
  const query = q.trim();

  if (!key) {
    return libraryDataSchema.parse(buildMockLibrary(sido, sigungu, "book", q));
  }
  // 검색어 없으면 빈 결과 (안내).
  if (!query) {
    return libraryDataSchema.parse(emptyBookData(region, ""));
  }

  try {
    // 1단계 — 도서 검색 (목록). 제목에 검색어 포함된 책 우선 정렬.
    const books = await searchBooks(key, query, abort);
    const q2 = query.toLowerCase();
    books.sort((a, b) => {
      const am = a.title.toLowerCase().includes(q2) ? 0 : 1;
      const bm = b.title.toLowerCase().includes(q2) ? 0 : 1;
      return am - bm; // 제목 매칭 우선 (정보나루는 대출순이라 재정렬)
    });

    // isbn 미선택 — 도서 목록만.
    if (!isbn) {
      return libraryDataSchema.parse({
        region,
        mode: "book",
        query,
        libraries: [],
        total: 0,
        books: books.slice(0, 20),
        matchedBook: null,
        source: "live",
      });
    }

    // 2단계 — 선택된 isbn 소장 도서관.
    // ⚠️ libSrchByBook 파라미터는 'isbn'(NOT isbn13) + region(필수).
    const selected = books.find((b) => b.isbn === isbn) ?? null;
    const params = new URLSearchParams({ authKey: key, isbn, format: "json" });
    if (regionCode) params.set("region", regionCode);
    const res = await fetch(`${LIB_BY_BOOK_BASE}?${params.toString()}`, { signal: abort });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const parsed = JSON.parse(text) as { response?: { libs?: RawLibEntry[] } };
    const entries = parsed.response?.libs ?? [];

    let libraries = entries
      .map((e) => normalize(e.lib))
      .filter((l): l is Library => l !== null)
      .map((l) => ({ ...l, holdsBook: true }));

    if (sigungu) {
      const matched = libraries.filter((l) => l.address.includes(sigungu));
      if (matched.length > 0) libraries = matched;
    }
    libraries = libraries.slice(0, 50);

    // 대출 가능 여부 — 상위 N곳만 bookExist 병렬 조회. 실패하면 bookAvailable=null(소장만).
    const checked = await Promise.all(
      libraries.slice(0, LOAN_CHECK_LIMIT).map(async (lib) => {
        const avail = await checkLoan(key, lib.id, isbn, abort).catch(() => null);
        return { ...lib, bookAvailable: avail };
      }),
    );
    libraries = [...checked, ...libraries.slice(LOAN_CHECK_LIMIT)];

    return libraryDataSchema.parse({
      region,
      mode: "book",
      query,
      libraries,
      total: libraries.length,
      books: books.slice(0, 20),
      matchedBook: selected,
      source: "live",
    });
  } catch (err) {
    logger.warn("library.fetchByBook failed, using mock", {
      query,
      error: err instanceof Error ? err.message : String(err),
    });
    return libraryDataSchema.parse(buildMockLibrary(sido, sigungu, "book", q));
  }
}

function emptyBookData(region: string, query: string): LibraryData {
  return {
    region,
    mode: "book",
    query,
    libraries: [],
    total: 0,
    books: [],
    matchedBook: null,
    source: "live",
  };
}

async function searchBooks(
  key: string,
  keyword: string,
  abort: AbortSignal,
): Promise<MatchedBook[]> {
  const params = new URLSearchParams({
    authKey: key,
    keyword,
    pageSize: "30",
    format: "json",
  });
  const res = await fetch(`${SRCH_BOOKS_BASE}?${params.toString()}`, { signal: abort });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const parsed = JSON.parse(text) as { response?: { docs?: RawBookEntry[] } };
  const docs = parsed.response?.docs ?? [];
  return docs
    .map((e) => e.doc)
    .filter((d): d is RawBook => !!d && !!d.bookname)
    .map((d) => ({
      title: cleanTitle(d.bookname!),
      author: d.authors?.trim() || null,
      publisher: d.publisher?.trim() || null,
      isbn: d.isbn13 != null ? String(d.isbn13).trim() : null,
      imageUrl: d.bookImageURL?.trim() || null,
      year: d.publication_year != null ? String(d.publication_year).trim() : null,
    }))
    .filter((b) => b.isbn); // 소장 조회하려면 isbn 필수
}

// "종의 기원 =정유정 장편소설 /The origin of species " → "종의 기원"
function cleanTitle(raw: string): string {
  return raw.split(/[=/]/)[0].replace(/\s+/g, " ").trim() || raw.trim();
}

// 도서관별 소장+대출가능 조회. response.result.loanAvailable Y/N.
// bookExist 파라미터는 isbn13 + libCode (libSrchByBook은 isbn였는데 API마다 다름).
// 응답 형식이 안 맞으면 null 반환 → UI는 '소장'만 표시.
async function checkLoan(
  key: string,
  libCode: string,
  isbn: string,
  abort: AbortSignal,
): Promise<boolean | null> {
  const params = new URLSearchParams({
    authKey: key,
    libCode,
    isbn13: isbn,
    format: "json",
  });
  const res = await fetch(`${BOOK_EXIST_BASE}?${params.toString()}`, { signal: abort });
  if (!res.ok) return null;
  const text = await res.text();
  const parsed = JSON.parse(text) as {
    response?: { result?: { hasBook?: string; loanAvailable?: string } };
  };
  const loan = parsed.response?.result?.loanAvailable;
  if (loan === "Y") return true;
  if (loan === "N") return false;
  return null;
}

function normalize(lib: RawLib | undefined): Library | null {
  if (!lib || !lib.libName) return null;
  const address = lib.address?.trim() ?? "";
  const operatingTime = lib.operatingTime?.trim();
  return {
    id: String(lib.libCode ?? lib.libName),
    name: lib.libName.trim(),
    address,
    sigungu: extractSigungu(address),
    tel: lib.tel?.trim() || null,
    homepage: lib.homepage?.trim() || null,
    openHours: operatingTime && operatingTime !== "-" ? operatingTime : null,
    closedDays: lib.closed?.trim() || null,
    bookCount: parseIntSafe(lib.BookCount),
    latitude: parseFloatSafe(lib.latitude),
    longitude: parseFloatSafe(lib.longitude),
    holdsBook: null,
    bookAvailable: null,
  };
}

// "대전광역시 서구 가수원로 91-11" → "서구"
function extractSigungu(address: string): string {
  const parts = address.split(/\s+/);
  return parts[1] ?? "";
}

function parseIntSafe(v: string | number | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseFloatSafe(v: string | number | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
