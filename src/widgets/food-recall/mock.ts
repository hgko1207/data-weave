import type { RecallItem } from "./schema";

export const mockRecalls: RecallItem[] = [
  {
    id: "mock-1",
    productName: "OO우유 200ml",
    company: "(주)테스트유업",
    recallDate: isoDaysAgo(0),
    reason: "이물(머리카락) 혼입",
    imageUrl: null,
  },
  {
    id: "mock-2",
    productName: "혼합견과 30g",
    company: "(주)샘플견과",
    recallDate: isoDaysAgo(0),
    reason: "알레르기 유발물질(땅콩) 표시 누락",
    imageUrl: null,
  },
  {
    id: "mock-3",
    productName: "냉동만두 1.4kg",
    company: "(주)데이터식품",
    recallDate: isoDaysAgo(1),
    reason: "대장균군 검출 (식품공전 기준 초과)",
    imageUrl: null,
  },
  {
    id: "mock-4",
    productName: "프리미엄 초콜릿 50g",
    company: "(주)위브푸드",
    recallDate: isoDaysAgo(1),
    reason: "유통기한 표시 오기",
    imageUrl: null,
  },
];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - 6);
  return d.toISOString();
}
