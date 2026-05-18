import type { ApartmentTrade, ApartmentData } from "./schema";

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

const DONG_POOL = [
  "봉명동",
  "도룡동",
  "노은동",
  "관평동",
  "지족동",
  "전민동",
  "갑동",
  "구즉동",
];

const ROAD_POOL = ["대학로", "온천로", "노은로", "관평로", "한밭대로", "엑스포로"];

// djb2 hash — region 문자열에서 결정적 시드 추출.
// 시드를 써서 시·도/시·군·구마다 다른 mock 데이터가 보이도록.
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
  const dongRotate = seed % DONG_POOL.length;
  const roadRotate = seed % ROAD_POOL.length;
  // ±20% 폭으로 base 금액을 region별 변동
  const amountShift = ((seed % 24000) | 0) - 12000;
  // 시·도 prefix 추출 — 단지명에 region 흔적 한 줄
  const sidoShort = region.split(" ")[0]?.replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, "") ?? "";

  const now = new Date();
  const trades: ApartmentTrade[] = Array.from({ length: 12 }, (_, i) => {
    const aptName = `${sidoShort}${APT_NAMES[(i + aptRotate) % APT_NAMES.length]}`;
    const area = 59 + (i % 5) * 17;
    const baseAmount = 45000 + amountShift + (i % 4) * 12000 + (i % 3) * 5000;
    const dealAmount = Math.max(8000, baseAmount + ((i * 1234) % 8000));
    const pyeong = (area * 1.296) / 3.3058;
    const day = ((i * 7) % 27) + 1;
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    const dong = DONG_POOL[(i + dongRotate) % DONG_POOL.length];
    const road = ROAD_POOL[(i + roadRotate) % ROAD_POOL.length];
    return {
      id: `mock-${i}-${aptName}`,
      aptName,
      aptDong: i % 3 === 0 ? `${101 + (i % 5)}동` : null,
      dong,
      jibun: `${100 + i * 13}`,
      roadName: `${region} ${road} ${10 + i}`,
      dealDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      dealAmount,
      area,
      pricePerPyeong: Math.round((dealAmount / pyeong) * 10) / 10,
      floor: 3 + ((i * 5) % 18),
      buildYear: 2005 + (i % 18),
      dealType: i % 5 === 0 ? "직거래" : "중개거래",
      agentSido: i % 5 === 0 ? null : `${sidoShort} ${dong}`,
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
