export function formatAmount(manwon: number | null): string {
  if (manwon == null) return "—";
  if (manwon >= 10000) {
    const eok = manwon / 10000;
    return `${eok.toFixed(1)}억`;
  }
  return `${manwon.toLocaleString()}만`;
}

// API는 전용면적만 제공. 한국 아파트 통상 공급/전용 비율 1.30 사용해
// '분양 평형' (33평형 등 흔히 부르는 평수) 추정. 빌딩마다 1.28~1.35 정도라
// 결과는 ±1평 오차 가능 — 'pyeongLabel'은 '약 X평'으로 명시.
export const SUPPLY_RATIO = 1.296;
export const SQM_PER_PYEONG = 3.3058;

export function supplyPyeong(excluArea: number): number {
  return (excluArea * SUPPLY_RATIO) / SQM_PER_PYEONG;
}

export function exclusivePyeong(excluArea: number): number {
  return excluArea / SQM_PER_PYEONG;
}

export function pyeongLabel(excluArea: number): string {
  if (!Number.isFinite(excluArea) || excluArea <= 0) return "—";
  return `약 ${Math.round(supplyPyeong(excluArea))}평`;
}
