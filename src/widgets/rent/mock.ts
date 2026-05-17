import type { RentTrade, RentData } from "./schema";

const APT_NAMES = [
  "유성스카이뷰",
  "도룡SK뷰",
  "노은한화꿈에그린",
  "관평테크노밸리",
  "지족반석",
  "전민동선비마을",
];

export function buildMockRent(region: string, dealYm: string): RentData {
  const now = new Date();
  const trades: RentTrade[] = Array.from({ length: 12 }, (_, i) => {
    const aptName = APT_NAMES[i % APT_NAMES.length];
    const area = 59 + (i % 4) * 17;
    const isJeonse = i % 3 !== 0; // 2/3는 전세
    const deposit = isJeonse ? 20000 + (i % 5) * 4000 : 3000 + (i % 4) * 2000;
    const monthlyRent = isJeonse ? 0 : 50 + (i % 6) * 15;
    const day = ((i * 5) % 27) + 1;
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    return {
      id: `mock-${i}-${aptName}`,
      aptName,
      dong: ["봉명동", "도룡동", "노은동", "관평동", "지족동", "전민동"][i % 6],
      jibun: `${100 + i * 13}`,
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
