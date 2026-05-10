import { SidebarContent } from "./SidebarContent";

export function Sidebar() {
  return (
    <aside
      aria-label="주 메뉴"
      className="sticky top-0 z-30 flex h-screen w-60 shrink-0 flex-col border-r border-white/5 bg-zinc-950/80 backdrop-blur"
    >
      <SidebarContent />
    </aside>
  );
}
