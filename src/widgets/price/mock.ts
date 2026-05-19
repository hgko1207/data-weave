import type { PriceData, PriceItem, RegionPrice, TrendPoint } from "./schema";
import { CATALOG } from "./catalog";

const SIDOS = [
  "서울특별시",
  "부산광역시",
  "대전광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "경기도",
  "강원특별자치도",
];

function itemSeed(item: PriceItem): number {
  let h = 5381;
  const s = item.id;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

// 품목별 base 가격 추정 (mock 시각화용 — 실제와 다를 수 있음)
function basePriceFor(item: PriceItem): number {
  const map: Record<string, number> = {
    "veg-cabbage": 4500,
    "veg-radish": 2200,
    "veg-onion": 2800,
    "veg-garlic": 12000,
    "veg-pepper": 9500,
    "veg-spinach": 6000,
    "veg-lettuce": 1500,
    "fruit-apple": 28000,
    "fruit-pear": 32000,
    "fruit-mandarin": 7800,
    "fruit-grape": 9500,
    "fruit-peach": 12000,
    "fruit-strawberry": 18000,
    "meat-pork": 2400,
    "meat-beef": 9800,
    "meat-chicken": 6500,
    "meat-egg": 6800,
    "sea-mackerel": 3200,
    "sea-squid": 4500,
    "sea-laver": 9800,
    "sea-anchovy": 35000,
    "grain-rice": 58000,
    "grain-bean": 9500,
    "grain-flour": 2300,
  };
  return map[item.id] ?? 5000;
}

function currentYmList(now: Date, months: number): Array<{ ym: string; label: string }> {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const out: Array<{ ym: string; label: string }> = [];
  for (let i = months - 1; i >= 0; i--) {
    const t = new Date(Date.UTC(y, m - i, 1));
    const yy = t.getUTCFullYear();
    const mm = t.getUTCMonth() + 1;
    out.push({
      ym: `${yy}${String(mm).padStart(2, "0")}`,
      label: `${mm}월`,
    });
  }
  return out;
}

export function buildMockPrice(item: PriceItem, now: Date): PriceData {
  const seed = itemSeed(item);
  const base = basePriceFor(item);

  // 시·도별 가격 — base 대비 ±15%
  const regionPrices: RegionPrice[] = SIDOS.map((sido, i) => {
    const s = seed + i * 31;
    const variance = ((s % 30) - 15) / 100; // -0.15 ~ +0.15
    const price = Math.round(base * (1 + variance));
    const prevMonthV = ((s >> 4) % 20 - 10) / 100;
    const prevYearV = ((s >> 8) % 40 - 20) / 100;
    return {
      sido,
      price,
      prevMonth: Math.round(price * (1 - prevMonthV)),
      prevYear: Math.round(price * (1 - prevYearV)),
    };
  });

  // 최근 6개월 전국 평균 추이
  const ymList = currentYmList(now, 6);
  const trend: TrendPoint[] = ymList.map(({ ym, label }, i) => {
    const s = seed + i * 13;
    const variance = ((s % 24) - 12) / 100;
    return {
      ym,
      label,
      avg: Math.round(base * (1 + variance)),
    };
  });

  // 전국 평균
  const sum = regionPrices.reduce((a, r) => a + r.price, 0);
  const nationwideAvg = Math.round(sum / regionPrices.length);
  const prevMonthSum = regionPrices.reduce((a, r) => a + (r.prevMonth ?? r.price), 0);
  const prevYearSum = regionPrices.reduce((a, r) => a + (r.prevYear ?? r.price), 0);
  const nationwidePrevMonth = Math.round(prevMonthSum / regionPrices.length);
  const nationwidePrevYear = Math.round(prevYearSum / regionPrices.length);

  return {
    item,
    nationwideAvg,
    nationwidePrevMonth,
    nationwidePrevYear,
    regionPrices,
    trend,
    catalog: CATALOG[item.category],
    source: "mock",
  };
}
