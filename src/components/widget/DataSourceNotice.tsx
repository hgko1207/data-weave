import { AlertTriangle, FlaskConical } from "lucide-react";

// 위젯 페이지 상단의 데이터 소스 알림.
// - errorMessage: fetch 실패 시 amber 박스로 사유 표시 (mock으로 폴백된 상태).
// - source === 'mock' (errorMessage 없을 때): API 키 없거나 사전 조건 미충족으로
//   처음부터 mock 사용 중임을 작은 chip으로 알림. 실거래 데이터로 오해 방지.
type Props = {
  errorMessage?: string;
  source: "live" | "mock";
};

export function DataSourceNotice({ errorMessage, source }: Props) {
  if (errorMessage) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <p className="leading-relaxed">
          데이터를 불러오지 못해 샘플로 표시 중입니다.{" "}
          <span className="font-mono text-amber-300/80">{errorMessage}</span>
        </p>
      </div>
    );
  }

  if (source === "mock") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-1 text-xs text-amber-200">
        <FlaskConical className="h-3 w-3" aria-hidden />
        샘플 데이터로 표시 중 · API 키 미설정
      </div>
    );
  }

  return null;
}
