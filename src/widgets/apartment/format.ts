export function formatAmount(manwon: number | null): string {
  if (manwon == null) return "—";
  if (manwon >= 10000) {
    const eok = manwon / 10000;
    return `${eok.toFixed(1)}억`;
  }
  return `${manwon.toLocaleString()}만`;
}
