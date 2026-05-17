import type { ApartmentTrade, ApartmentData } from "./schema";

const APT_NAMES = [
  "유성스카이뷰",
  "도룡SK뷰",
  "노은한화꿈에그린",
  "관평테크노밸리",
  "지족반석",
  "전민동선비마을",
  "갑동현대",
  "구즉LG빌리지",
];

export function buildMockApartment(region: string, dealYm: string): ApartmentData {
  const now = new Date();
  const trades: ApartmentTrade[] = Array.from({ length: 12 }, (_, i) => {
    const aptName = APT_NAMES[i % APT_NAMES.length];
    const area = 59 + (i % 5) * 17;
    const baseAmount = 45000 + (i % 4) * 12000 + (i % 3) * 5000;
    const dealAmount = baseAmount + (i * 1234) % 8000;
    // 평당가는 공급평 기준 (전용 × 1.296)
    const pyeong = (area * 1.296) / 3.3058;
    const day = ((i * 7) % 27) + 1;
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    const dong = ["봉명동", "도룡동", "노은동", "관평동", "지족동", "전민동"][i % 6];
    return {
      id: `mock-${i}-${aptName}`,
      aptName,
      aptDong: i % 3 === 0 ? `${101 + (i % 5)}동` : null,
      dong,
      jibun: `${100 + i * 13}`,
      roadName: `대전 유성구 ${["대학로", "온천로", "노은로", "관평로"][i % 4]} ${10 + i}`,
      dealDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      dealAmount,
      area,
      pricePerPyeong: Math.round((dealAmount / pyeong) * 10) / 10,
      floor: 3 + ((i * 5) % 18),
      buildYear: 2005 + (i % 18),
      dealType: i % 5 === 0 ? "직거래" : "중개거래",
      agentSido: i % 5 === 0 ? null : `대전 ${dong}`,
      sellerType: i % 4 === 0 ? "법인" : "개인",
      buyerType: i % 7 === 0 ? "법인" : "개인",
      rgstDate: i % 6 === 0 ? null : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(Math.min(28, day + 14)).padStart(2, "0")}`,
      cancelDealDay: null,
    };
  });

  const amounts = trades.map((t) => t.dealAmount).sort((a, b) => a - b);
  const sum = amounts.reduce((a, b) => a + b, 0);
  const median = amounts[Math.floor(amounts.length / 2)];

  return {
    region,
    dealYm,
    trades,
    totalCount: trades.length,
    avgAmount: Math.round(sum / amounts.length),
    medianAmount: median,
    minAmount: amounts[0],
    maxAmount: amounts[amounts.length - 1],
    source: "mock",
  };
}
