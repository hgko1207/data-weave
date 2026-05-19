import type { LottoData, TopStore } from "./schema";

const STORE_NAMES = [
  "복권명당",
  "행운로또",
  "황금복권방",
  "대박편의점",
  "1등로또방",
  "복권나라",
  "행운슈퍼",
  "황금당첨",
  "꿈의로또",
  "당첨편의점",
];

const SIDOS = [
  "서울특별시",
  "경기도",
  "부산광역시",
  "대전광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "울산광역시",
  "강원특별자치도",
  "충청남도",
];

// 회차 → 결정적 시드
function roundSeed(round: number): number {
  let h = 5381 + round * 31;
  for (let i = 0; i < 16; i++) h = ((h << 5) + h + ((h >> 7) | 0)) >>> 0;
  return h;
}

function pickNumbers(seed: number): { numbers: number[]; bonus: number } {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  let s = seed;
  for (let i = pool.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) >>> 0;
    const j = s % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const numbers = pool.slice(0, 6).sort((a, b) => a - b);
  const bonus = pool[6];
  return { numbers, bonus };
}

function isoForRound(round: number): string {
  // 1회차 2002-12-07 토요일 시작. 매주 토요일.
  const base = new Date(Date.UTC(2002, 11, 7));
  const d = new Date(base.getTime() + (round - 1) * 7 * 24 * 60 * 60 * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function currentLatestRound(now: Date): number {
  // 1회차 = 2002-12-07. 그 이후 토요일마다 1회 추첨.
  const base = Date.UTC(2002, 11, 7);
  const diff = now.getTime() - base;
  const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, weeks + 1);
}

export function buildMockLotto(round: number, latestRound: number): LottoData {
  const seed = roundSeed(round);
  const { numbers, bonus } = pickNumbers(seed);
  const winners = ((seed % 18) | 0) + 3; // 3~20명
  const totalAmount = 20_000_000_000 + (seed % 10_000_000_000); // 200~300억대
  const amountPerWinner = Math.floor(totalAmount / winners);

  const topStores: TopStore[] = Array.from({ length: 12 }, (_, i) => {
    const nameIdx = (seed + i) % STORE_NAMES.length;
    const sidoIdx = (seed + i * 3) % SIDOS.length;
    return {
      name: `${STORE_NAMES[nameIdx]} ${i + 1}호점`,
      address: `${SIDOS[sidoIdx]} ${((seed + i * 7) % 25) + 1}구 ${((seed + i * 13) % 30) + 1}로 ${10 + i}`,
      sido: SIDOS[sidoIdx],
      method: (["auto", "manual", "mixed"] as const)[i % 3],
    };
  });

  return {
    round,
    drawDate: isoForRound(round),
    numbers,
    bonus,
    firstPrizeAmount: amountPerWinner,
    firstPrizeWinners: winners,
    topStores,
    latestRound,
    source: "mock",
  };
}
