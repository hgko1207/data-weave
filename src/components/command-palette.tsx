"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { LayoutGrid, Settings } from "lucide-react";
import { WIDGET_META } from "@/widgets/_metadata";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="명령"
      description="페이지·위젯으로 빠르게 이동"
    >
      <CommandInput placeholder="대시보드, 날씨, 설정…" />
      <CommandList>
        <CommandEmpty>일치하는 항목이 없습니다.</CommandEmpty>
        <CommandGroup heading="이동">
          <CommandItem onSelect={() => go("/")}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            대시보드
          </CommandItem>
          <CommandItem onSelect={() => go("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            설정
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="공공데이터">
          {WIDGET_META.map((w) => {
            const Icon = w.icon;
            return (
              <CommandItem key={w.id} onSelect={() => go(`/w/${w.id}`)}>
                <Icon className="mr-2 h-4 w-4 text-emerald-400" />
                {w.title}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
