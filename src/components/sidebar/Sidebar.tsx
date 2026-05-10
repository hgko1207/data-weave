import { SidebarContent } from "./SidebarContent";

export function Sidebar() {
  return (
    <aside
      aria-label="주 메뉴"
      className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/5 bg-zinc-950/80 backdrop-blur md:flex"
    >
      <SidebarContent />
    </aside>
  );
}
