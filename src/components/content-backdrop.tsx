import type { WidgetGroup } from "@/widgets/_metadata";
import { CONTENT_BACKDROP_INSET } from "@/lib/layout-dims";

// 위젯 그룹별 content 영역 배경 틴트 (생활·안전 / 부동산 / 문화·여가).
// 카드는 솔리드(zinc-900)라 위에서 가독성 유지. 날씨는 자체 우주 배경을 써서 여기 제외.
const GROUP_TINT: Record<WidgetGroup, string> = {
  living: "from-emerald-950/30",
  realestate: "from-amber-950/20",
  culture: "from-violet-950/28",
};

export function ContentBackdrop({ group }: { group: WidgetGroup }) {
  return (
    <div
      aria-hidden
      className={`${CONTENT_BACKDROP_INSET} bg-gradient-to-b ${GROUP_TINT[group]} via-zinc-950 to-zinc-950`}
    />
  );
}
