import { Building2, AlertTriangle, ShieldCheck } from "lucide-react";
import type { FoodRecallData, RecallItem } from "@/widgets/food-recall/schema";

type Grade = "all" | "1" | "2" | "3";

export function FoodRecallDetail({
  data,
  gradeFilter = "all",
}: {
  data: FoodRecallData;
  gradeFilter?: Grade;
}) {
  const hasFilter = data.matchedKeywords.length > 0;
  const filteredItems =
    gradeFilter === "all"
      ? data.items
      : data.items.filter((it) => extractGrade(it.reason)?.includes(gradeFilter));
  const filteredTotal =
    gradeFilter === "all"
      ? data.filteredTotal
      : filteredItems.length;

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-base font-semibold text-zinc-100">검색 결과</h2>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
            최근 {data.windowHours}시간
          </p>
        </div>
        <div className="flex items-baseline gap-4 text-sm">
          <span className="flex items-baseline gap-1">
            <span className="text-xs text-zinc-500">매칭</span>
            <span
              className={`font-mono text-base font-semibold tabular-nums ${
                filteredTotal > 0 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {filteredTotal}
            </span>
            <span className="text-xs text-zinc-500">건</span>
          </span>
          <span className="flex items-baseline gap-1">
            <span className="text-xs text-zinc-500">전체</span>
            <span className="font-mono text-base font-semibold tabular-nums text-zinc-200">
              {data.total}
            </span>
            <span className="text-xs text-zinc-500">건</span>
          </span>
        </div>
      </header>

      {hasFilter ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 px-6 py-3">
          <span className="text-xs text-zinc-500">매칭된 키워드</span>
          <div className="flex flex-wrap gap-1.5">
            {data.matchedKeywords.map((kw) => (
              <span
                key={kw}
                className="rounded-md bg-amber-500/15 px-2 py-0.5 font-mono text-xs text-amber-300"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {filteredTotal === 0 ? (
        <EmptyState hasFilter={hasFilter} gradeFilter={gradeFilter} data={data} />
      ) : null}

      <ul className="divide-y divide-zinc-800/60">
        {filteredItems.map((it) => (
          <RecallRow key={it.id} item={it} matched={data.matchedKeywords} />
        ))}
      </ul>

      {data.source === "mock" ? (
        <p className="border-t border-zinc-800/80 px-6 py-3 font-mono text-xs uppercase tracking-wider text-zinc-500">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </article>
  );
}

function EmptyState({
  hasFilter,
  gradeFilter,
  data,
}: {
  hasFilter: boolean;
  gradeFilter: Grade;
  data: FoodRecallData;
}) {
  const gradeLabel = gradeFilter === "all" ? null : `${gradeFilter}등급`;
  let title: string;
  let hint: string;
  if (gradeLabel && hasFilter) {
    title = `${gradeLabel} + 키워드 매칭 리콜이 없어요.`;
    hint = "등급 또는 키워드를 풀어 다시 보세요.";
  } else if (gradeLabel) {
    title = `최근 ${data.windowHours}시간 ${gradeLabel} 리콜이 없어요.`;
    hint = "등급 필터를 '전체'로 바꾸거나 기간을 늘려보세요.";
  } else if (hasFilter) {
    title = "키워드 매칭 리콜이 없어요.";
    hint = "전체 리콜은 위 카운트에서 확인할 수 있어요.";
  } else {
    title = `최근 ${data.windowHours}시간 신규 리콜이 없어요. 안심`;
    hint = "기간을 더 늘려보거나 키워드를 등록해보세요.";
  }
  return (
    <div className="px-6 py-12 text-center">
      <ShieldCheck className="mx-auto h-7 w-7 text-emerald-400" aria-hidden />
      <p className="mt-3 text-base font-medium text-zinc-100">{title}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

function RecallRow({
  item,
  matched,
}: {
  item: RecallItem;
  matched: string[];
}) {
  const grade = extractGrade(item.reason);
  const isMatched = matched.some(
    (kw) =>
      item.productName.toLowerCase().includes(kw.toLowerCase()) ||
      item.reason.toLowerCase().includes(kw.toLowerCase()),
  );
  return (
    <li className={`px-6 py-4 transition ${isMatched ? "bg-amber-500/[0.04]" : ""}`}>
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-400"
        >
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            {grade ? (
              <span
                className={`font-mono text-xs font-semibold uppercase tracking-wider ${gradeColor(
                  grade,
                )}`}
              >
                {grade}
              </span>
            ) : null}
            <h3 className="text-base font-medium text-zinc-100">{item.productName}</h3>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
            <Building2 className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
            <span className="truncate">{item.company || "회사 정보 없음"}</span>
            <span aria-hidden className="text-zinc-600">·</span>
            <span className="font-mono text-xs text-zinc-500">
              {formatDate(item.recallDate)}
            </span>
          </p>
          <p className="mt-2 text-sm text-amber-200/90">{stripGradePrefix(item.reason)}</p>
        </div>
      </div>
    </li>
  );
}

function extractGrade(reason: string): string | null {
  const m = reason.match(/^\[([^\]]+)\]/);
  return m ? m[1] : null;
}

function stripGradePrefix(reason: string): string {
  return reason.replace(/^\[[^\]]+\]\s*/, "");
}

function gradeColor(grade: string): string {
  if (grade.includes("1")) return "text-rose-300";
  if (grade.includes("2")) return "text-amber-300";
  if (grade.includes("3")) return "text-zinc-400";
  return "text-zinc-400";
}

function formatDate(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
