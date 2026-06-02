import type { TourData, TourItem, TourCategory } from "./schema";

function regionSeed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

const TITLE_POOL: Record<Exclude<TourCategory, "all">, string[]> = {
  nature: ["국립공원 둘레길", "수목원", "전망대", "강변 산책로", "산림욕장"],
  culture: ["역사박물관", "미술관", "기념관", "문화의 거리", "전통시장"],
  festival: ["야경 축제", "벚꽃 축제", "단풍 축제", "빛 축제", "음식 축제"],
  leisure: ["체험 농장", "테마파크", "수영장", "스파", "캠핑장"],
  shopping: ["로컬 마켓", "면세점", "전통 공예 거리", "특산물 시장", "아울렛"],
};

const CATEGORIES: Array<Exclude<TourCategory, "all">> = [
  "nature",
  "culture",
  "festival",
  "leisure",
  "shopping",
];

export function buildMockTour(
  region: string,
  sigungu: string,
  category: TourCategory,
): TourData {
  const seed = regionSeed(`${region}-${sigungu}-${category}`);
  const items: TourItem[] = [];
  const targetCount = 12;

  const pickCategories: Array<Exclude<TourCategory, "all">> =
    category === "all" ? CATEGORIES : [category];

  for (let i = 0; i < targetCount; i++) {
    const cat = pickCategories[i % pickCategories.length];
    const titlePool = TITLE_POOL[cat];
    const title = `${region.split(" ")[0]?.replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, "") ?? ""} ${
      titlePool[(i + seed) % titlePool.length]
    }${i > pickCategories.length ? ` ${Math.floor(i / pickCategories.length) + 1}` : ""}`;
    const hasImage = i % 4 !== 0; // 일부는 이미지 없는 케이스도 시뮬레이션
    items.push({
      id: `mock-tour-${region}-${i}-${cat}`,
      title,
      category: cat,
      address: `${region} ${sigungu} ${((seed + i) % 6) + 1}동 ${100 + i * 13}`,
      sigungu,
      // mock 이미지: 카테고리별 placeholder (실제 외부 이미지 fetch는 안 함 — 깨지지 않게 null)
      imageUrl: hasImage ? null : null,
      tel: i % 3 !== 0 ? `042-${600 + (seed % 100)}-${1000 + i * 13}` : null,
      homepage: i % 2 === 0 ? `https://tour.example.org/${i}` : null,
      overview:
        cat === "festival"
          ? "지역 대표 축제로 매년 개최. 다양한 체험·공연 프로그램 진행."
          : cat === "nature"
            ? "자연 경관이 아름다운 명소. 사계절 산책·트레킹에 적합."
            : cat === "culture"
              ? "지역 문화·역사를 깊이 체험할 수 있는 공간."
              : cat === "leisure"
                ? "가족 단위 방문객에게 인기 있는 체험형 시설."
                : "지역 특산물·전통 공예품을 만나볼 수 있는 곳.",
      startDate:
        cat === "festival"
          ? `2026-${String(((seed + i) % 12) + 1).padStart(2, "0")}-${String(((seed + i * 3) % 27) + 1).padStart(2, "0")}`
          : null,
      endDate:
        cat === "festival"
          ? `2026-${String(((seed + i) % 12) + 1).padStart(2, "0")}-${String(((seed + i * 3) % 27) + 7).padStart(2, "0")}`
          : null,
    });
  }

  return {
    region: sigungu ? `${region} ${sigungu}` : `${region} 전체`,
    category,
    items,
    total: items.length,
    source: "mock",
  };
}
