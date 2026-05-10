import { WIDGET_META } from "@/widgets/_metadata";

export type PageTitle = {
  eyebrow?: string;
  title: string;
};

export function getPageTitle(pathname: string): PageTitle {
  if (pathname === "/") return { eyebrow: "dashboard", title: "오늘의 한국 공공데이터" };
  if (pathname === "/settings") return { eyebrow: "settings", title: "설정" };
  if (pathname.startsWith("/w/")) {
    const id = pathname.replace(/^\/w\//, "");
    const meta = WIDGET_META.find((w) => w.id === id);
    if (meta) return { eyebrow: "widget", title: meta.title };
  }
  return { title: "DataWeave" };
}
