import { SidebarContent } from "./SidebarContent";

export function Sidebar() {
  return (
    <aside
      aria-label="주 메뉴"
      className="sticky top-0 z-30 flex h-screen w-14 shrink-0 flex-col border-r border-white/[0.08] bg-zinc-900/95 backdrop-blur-sm md:w-64"
    >
      <SidebarContent />
    </aside>
  );
}
