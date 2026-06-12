"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SidebarContent } from "./SidebarContent";

// 모바일/태블릿(<md)에서 사이드바를 햄버거 drawer로. 데스크톱은 Sidebar 컴포넌트가 직접 표시.
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="메뉴 열기"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 md:hidden"
      >
        <Menu className="h-4 w-4" aria-hidden />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="border-zinc-800/80 bg-zinc-900 p-0"
        >
          <SheetTitle className="sr-only">메뉴</SheetTitle>
          <SheetDescription className="sr-only">
            DataWeave 사이드바 네비게이션
          </SheetDescription>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
