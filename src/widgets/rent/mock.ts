import type { RentTrade, RentData } from "./schema";

// region을 모르는 generic 단지명. region prefix를 붙이면 시·군·구가 실제 분포와
// 어긋날 때 어색해지므로 일반화. mock 배지로 데이터 출처는 명시됨.
const APT_NAMES = [
  "스카이뷰",
  "SK뷰",
  "한화꿈에그린",
  "테크노밸리",
  "반석마을",
  "선비마을",
  "현대아파트",
  "LG빌리지",
];

function regionSeed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function buildMockRent(region: string, dealYm: string): RentData {
  const seed = regionSeed(region);
  const aptRotate = seed % APT_NAMES.length;
  const depositShift = ((seed % 12000) | 0) - 6000; // ±6000만원

  const now = new Date();
  const trades: RentTrade[] = Array.from({ length: 12 }, (_, i) => {
    const aptName = APT_NAMES[(i + aptRotate) % APT_NAMES.length];
    const area = 59 + (i % 4) * 17;
    const isJeonse = i % 3 !== 0;
    const baseDeposit = isJeonse
      ? 20000 + depositShift + (i % 5) * 4000
      : 3000 + Math.round(depositShift / 4) + (i % 4) * 2000;
    const deposit = Math.max(1000, baseDeposit);
    const monthlyRent = isJeonse ? 0 : 50 + (i % 6) * 15;
    const day = ((i * 5) % 27) + 1;
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    return {
      id: `mock-${i}-${aptName}`,
      aptName,
      dong: `${((i + (seed % 6)) % 6) + 1}동`,
      jibun: null,
      dealDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      type: isJeonse ? "jeonse" : "monthly",
      deposit,
      monthlyRent,
      area,
      floor: 3 + ((i * 5) % 18),
      buildYear: 2005 + (i % 18),
    };
  });

  const jeonse = trades.filter((t) => t.type === "jeonse");
  const monthly = trades.filter((t) => t.type === "monthly");

  return {
    region,
    dealYm,
    trades,
    totalCount: trades.length,
    jeonseCount: jeonse.length,
    monthlyCount: monthly.length,
    avgJeonseDeposit:
      jeonse.length > 0
        ? Math.round(jeonse.reduce((a, t) => a + t.deposit, 0) / jeonse.length)
        : null,
    avgMonthlyDeposit:
      monthly.length > 0
        ? Math.round(monthly.reduce((a, t) => a + t.deposit, 0) / monthly.length)
        : null,
    avgMonthlyRent:
      monthly.length > 0
        ? Math.round(monthly.reduce((a, t) => a + t.monthlyRent, 0) / monthly.length)
        : null,
    source: "mock",
  };
}
