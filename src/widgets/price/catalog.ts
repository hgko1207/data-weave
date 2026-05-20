import type { PriceCategory } from "./schema";

// 우리 카테고리 → KAMIS 부류 코드(p_item_category_code).
// 100 식량작물 / 200 채소류 / 300 특용작물 / 400 과일류 / 500 축산물 / 600 수산물
export const CATEGORY_CODE: Record<PriceCategory, string> = {
  grain: "100",
  vegetable: "200",
  fruit: "400",
  meat: "500",
  seafood: "600",
};

export const CATEGORY_LABEL: Record<PriceCategory, string> = {
  grain: "식량작물",
  vegetable: "채소",
  fruit: "과일",
  meat: "축산",
  seafood: "수산",
};
