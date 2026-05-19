import type { PriceCategory, PriceItem } from "./schema";

// 카테고리별 대표 품목 카탈로그. 실 KAMIS API 연동 시 server에서 동적 받아오거나 expand 가능.
export const CATALOG: Record<PriceCategory, PriceItem[]> = {
  vegetable: [
    { id: "veg-cabbage", name: "배추", category: "vegetable", unit: "포기" },
    { id: "veg-radish", name: "무", category: "vegetable", unit: "개" },
    { id: "veg-onion", name: "양파", category: "vegetable", unit: "kg" },
    { id: "veg-garlic", name: "마늘", category: "vegetable", unit: "kg" },
    { id: "veg-pepper", name: "고추", category: "vegetable", unit: "kg" },
    { id: "veg-spinach", name: "시금치", category: "vegetable", unit: "kg" },
    { id: "veg-lettuce", name: "상추", category: "vegetable", unit: "100g" },
  ],
  fruit: [
    { id: "fruit-apple", name: "사과", category: "fruit", unit: "10개" },
    { id: "fruit-pear", name: "배", category: "fruit", unit: "10개" },
    { id: "fruit-mandarin", name: "감귤", category: "fruit", unit: "kg" },
    { id: "fruit-grape", name: "포도", category: "fruit", unit: "kg" },
    { id: "fruit-peach", name: "복숭아", category: "fruit", unit: "kg" },
    { id: "fruit-strawberry", name: "딸기", category: "fruit", unit: "kg" },
  ],
  meat: [
    { id: "meat-pork", name: "돼지고기 (삼겹살)", category: "meat", unit: "100g" },
    { id: "meat-beef", name: "한우 등심", category: "meat", unit: "100g" },
    { id: "meat-chicken", name: "닭고기", category: "meat", unit: "kg" },
    { id: "meat-egg", name: "계란", category: "meat", unit: "30개" },
  ],
  seafood: [
    { id: "sea-mackerel", name: "고등어", category: "seafood", unit: "마리" },
    { id: "sea-squid", name: "오징어", category: "seafood", unit: "마리" },
    { id: "sea-laver", name: "김", category: "seafood", unit: "100매" },
    { id: "sea-anchovy", name: "멸치", category: "seafood", unit: "kg" },
  ],
  grain: [
    { id: "grain-rice", name: "쌀", category: "grain", unit: "20kg" },
    { id: "grain-bean", name: "콩", category: "grain", unit: "kg" },
    { id: "grain-flour", name: "밀가루", category: "grain", unit: "kg" },
  ],
};

export function findItem(category: PriceCategory, id: string): PriceItem | null {
  return CATALOG[category]?.find((i) => i.id === id) ?? null;
}

export function defaultItem(category: PriceCategory): PriceItem {
  return CATALOG[category][0];
}

export const CATEGORY_LABEL: Record<PriceCategory, string> = {
  vegetable: "채소",
  fruit: "과일",
  meat: "축산",
  seafood: "수산",
  grain: "곡물",
};
