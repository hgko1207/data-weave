import type { PriceCategory, PriceCls, PriceData, PriceItem } from "./schema";

// 부류별 대표 품목 (실데이터 형태를 흉내). 실 API 연동 시 응답으로 대체됨.
const MOCK_ITEMS: Record<PriceCategory, Array<Omit<PriceItem, "id">>> = {
  vegetable: [
    { itemName: "배추", kindName: "봄(1포기)", rank: "상품", unit: "1포기", today: 3032, prevDay: 2615, prevWeek: 2715 },
    { itemName: "양배추", kindName: "양배추(1포기)", rank: "상품", unit: "1포기", today: 2635, prevDay: 2668, prevWeek: 2942 },
    { itemName: "무", kindName: "월동(1개)", rank: "상품", unit: "1개", today: 2272, prevDay: 2266, prevWeek: 2192 },
    { itemName: "오이", kindName: "다다기계통(10개)", rank: "상품", unit: "10개", today: 5176, prevDay: 5209, prevWeek: 5936 },
    { itemName: "양파", kindName: "양파(1kg)", rank: "상품", unit: "1kg", today: 1893, prevDay: 1880, prevWeek: 1853 },
    { itemName: "대파", kindName: "대파(1kg)", rank: "상품", unit: "1kg", today: 2619, prevDay: 2633, prevWeek: 2573 },
  ],
  fruit: [
    { itemName: "사과", kindName: "후지(10개)", rank: "상품", unit: "10개", today: 28140, prevDay: 27800, prevWeek: 29010 },
    { itemName: "배", kindName: "신고(10개)", rank: "상품", unit: "10개", today: 41200, prevDay: 41000, prevWeek: 42300 },
    { itemName: "감귤", kindName: "노지(1kg)", rank: "상품", unit: "1kg", today: 5300, prevDay: 5280, prevWeek: 5510 },
  ],
  meat: [
    { itemName: "쇠고기", kindName: "한우 등심 1등급(100g)", rank: "상품", unit: "100g", today: 9800, prevDay: 9750, prevWeek: 9900 },
    { itemName: "돼지고기", kindName: "삼겹살(100g)", rank: "상품", unit: "100g", today: 2400, prevDay: 2380, prevWeek: 2450 },
    { itemName: "닭고기", kindName: "닭(1kg)", rank: "상품", unit: "1kg", today: 6500, prevDay: 6480, prevWeek: 6550 },
    { itemName: "계란", kindName: "특란(30개)", rank: "상품", unit: "30개", today: 6800, prevDay: 6790, prevWeek: 6900 },
  ],
  seafood: [
    { itemName: "고등어", kindName: "냉동(1마리)", rank: "상품", unit: "1마리", today: 3200, prevDay: 3180, prevWeek: 3300 },
    { itemName: "오징어", kindName: "냉동(1마리)", rank: "상품", unit: "1마리", today: 4500, prevDay: 4480, prevWeek: 4600 },
    { itemName: "마른멸치", kindName: "중멸(1kg)", rank: "상품", unit: "1kg", today: 35000, prevDay: 35000, prevWeek: 34800 },
  ],
  grain: [
    { itemName: "쌀", kindName: "일반계(20kg)", rank: "상품", unit: "20kg", today: 58000, prevDay: 57900, prevWeek: 58200 },
    { itemName: "콩", kindName: "백태(1kg)", rank: "상품", unit: "1kg", today: 9500, prevDay: 9480, prevWeek: 9550 },
  ],
};

export function buildMockPrice(
  category: PriceCategory,
  cls: PriceCls,
  regday: string,
): PriceData {
  const rows = MOCK_ITEMS[category] ?? [];
  const items: PriceItem[] = rows.map((r, i) => ({
    id: `mock-${category}-${i}`,
    ...r,
  }));
  return {
    category,
    cls,
    regday,
    items,
    source: "mock",
  };
}
