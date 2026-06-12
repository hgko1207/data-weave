// content 영역만 덮는 배경 레이어가 공유 사용 — layout 치수 변경 시 이 상수만 수정.
// 모바일(<md): 사이드바가 drawer로 숨어있어 content 영역이 풀폭 (left-0).
// 데스크톱(md+): 사이드바 w-64 고정 (left-64). 헤더는 h-14로 동일.
export const CONTENT_BACKDROP_INSET =
  "pointer-events-none fixed bottom-0 left-0 right-0 top-14 z-0 md:left-64";
