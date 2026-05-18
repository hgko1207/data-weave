import type { ApartmentTrade, ApartmentData } from "./schema";

// region을 모르는 generic 단지명. region prefix를 붙이면 시·군·구가
// 실제 분포와 어긋날 때 어색해지므로 일반화. mock 배지가 데이터 출처를 명시한다.
const APT_NAMES = [
  "스카이뷰",
  "SK뷰",
  "한화꿈에그린",
  "테크노밸리",
  "반석마을",
  "선비마을",
  "현대아파트",
  "LG빌리지",
  "푸르지오",
  "롯데캐슬",
];

// djb2 hash — region 문자열에서 결정적 시드. 같은 region은 항상 같은 데이터.
function regionSeed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function buildMockApartment(region: string, dealYm: string): ApartmentData {
  const seed = regionSeed(region);
  const aptRotate = seed % APT_NAMES.length;
  // ±20% 폭으로 base 금액을 region별 변동 — 같은 단지여도 시·도별로 다른 가격대.
  const amountShift = ((seed % 24000) | 0) - 12000;

  const now = new Date();
  const trades: ApartmentTrade[] = Array.from({ length: 12 }, (_, i) => {
    const aptName = APT_NAMES[(i + aptRotate) % APT_NAMES.length];
    const area = 59 + (i % 5) * 17;
    const baseAmount = 45000 + amountShift + (i % 4) * 12000 + (i % 3) * 5000;
    const dealAmount = Math.max(8000, baseAmount + ((i * 1234) % 8000));
    const pyeong = (area * 1.296) / 3.3058;
    const day = ((i * 7) % 27) + 1;
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    // dong은 시·군·구별 실제 행정동을 가질 수 없으므로 'N동' generic. 도로명/지번 null —
    // 잘못된 정보를 주는 것보다 비공개로 두는 게 사용자에게 덜 혼란.
    const dong = `${((i + (seed % 6)) % 6) + 1}동`;
    return {
      id: `mock-${i}-${aptName}`,
      aptName,
      aptDong: i % 3 === 0 ? `${101 + (i % 5)}동` : null,
      dong,
      jibun: null,
      roadName: null,
      dealDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      dealAmount,
      area,
      pricePerPyeong: Math.round((dealAmount / pyeong) * 10) / 10,
      floor: 3 + ((i * 5) % 18),
      buildYear: 2005 + (i % 18),
      dealType: i % 5 === 0 ? "직거래" : "중개거래",
      agentSido: null,
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
