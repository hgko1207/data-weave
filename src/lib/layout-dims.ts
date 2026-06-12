// 사이드바 w-64(좌) · 헤더 h-14(상) 안쪽 = content 영역.
// content 영역만 덮는 배경 레이어가 공유 사용 — layout 치수 변경 시 이 상수만 수정.
export const CONTENT_BACKDROP_INSET =
  "pointer-events-none fixed bottom-0 left-64 right-0 top-14 z-0";
