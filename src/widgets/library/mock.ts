import type { Library, LibraryData, MatchedBook } from "./schema";

// region별 결정적 시드 — 같은 지역 = 같은 mock.
function regionSeed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

const LIBRARY_NAMES = [
  "시립도서관",
  "구립도서관",
  "어린이도서관",
  "평생학습관",
  "작은도서관",
  "문화의집",
  "중앙도서관",
  "북카페",
  "지혜의숲",
  "도서관분관",
];

export function buildMockLibrary(
  region: string,
  sigungu: string,
  mode: "location" | "book",
  query: string,
): LibraryData {
  const seed = regionSeed(`${region}-${sigungu}-${mode}-${query}`);
  const count = 6 + (seed % 5); // 6~10개
  const startIdx = seed % LIBRARY_NAMES.length;

  const libraries: Library[] = Array.from({ length: count }, (_, i) => {
    const baseName = LIBRARY_NAMES[(i + startIdx) % LIBRARY_NAMES.length];
    const name = `${sigungu} ${baseName}${i % 3 === 0 ? "" : ` ${(i % 3) + 1}호점`}`;
    const dongIdx = (seed + i) % 6;
    const dong = `${dongIdx + 1}동`;
    const hasTel = i % 4 !== 0;
    const hasHome = i % 3 !== 0;
    const closed = ["매주 월요일", "매주 화요일", "매월 첫째·셋째 수요일", null][i % 4];
    const holdsBook = mode === "book" ? (i + seed) % 3 !== 0 : null;
    const bookAvailable =
      mode === "book" && holdsBook ? (i + seed + 1) % 2 === 0 : null;
    return {
      id: `mock-lib-${region}-${i}-${baseName}`,
      name,
      address: `${region} ${sigungu} ${dong} ${100 + i * 17}`,
      sigungu,
      tel: hasTel ? `042-${600 + (seed % 100)}-${1000 + i * 13}` : null,
      homepage: hasHome ? `https://library.example.org/${i}` : null,
      openHours:
        i % 2 === 0
          ? "평일 09:00~22:00 · 주말 09:00~17:00"
          : "평일 09:00~18:00 · 주말 휴관",
      closedDays: closed,
      bookCount: 8000 + (seed % 50000) + i * 1500,
      holdsBook,
      bookAvailable,
    };
  });

  const matchedBook: MatchedBook | null =
    mode === "book" && query
      ? {
          title: query,
          author: ["김영하", "한강", "정세랑", "박완서"][seed % 4],
          publisher: ["문학동네", "창비", "민음사", "은행나무"][(seed >> 4) % 4],
          isbn: `9788${String(seed % 1_000_000_000).padStart(9, "0")}`,
        }
      : null;

  return {
    region: `${region} ${sigungu}`,
    mode,
    query,
    libraries,
    total: count,
    matchedBook,
    source: "mock",
  };
}
