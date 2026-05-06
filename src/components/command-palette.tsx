"use client";

import { useEffect, useState } from "react";
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
import { Cloud, Pill, ShieldAlert, Settings, LayoutGrid, Plus } from "lucide-react";

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
    <CommandDialog open={open} onOpenChange={onOpenChange} title="명령" description="위젯·페이지로 빠르게 이동">
      <CommandInput placeholder="위젯 추가, 설정, 카탈로그…" />
      <CommandList>
        <CommandEmpty>일치하는 항목이 없습니다.</CommandEmpty>
        <CommandGroup heading="이동">
          <CommandItem onSelect={() => go("/")}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            대시보드
          </CommandItem>
          <CommandItem onSelect={() => go("/catalog")}>
            <Plus className="mr-2 h-4 w-4" />
            위젯 카탈로그
          </CommandItem>
          <CommandItem onSelect={() => go("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            설정
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="위젯 추가">
          <CommandItem onSelect={() => go("/catalog?add=weather")}>
            <Cloud className="mr-2 h-4 w-4 text-emerald-400" />
            날씨
          </CommandItem>
          <CommandItem onSelect={() => go("/catalog?add=pharmacy")}>
            <Pill className="mr-2 h-4 w-4 text-emerald-400" />
            SOS 병원·약국
          </CommandItem>
          <CommandItem onSelect={() => go("/catalog?add=food-recall")}>
            <ShieldAlert className="mr-2 h-4 w-4 text-emerald-400" />
            식품 리콜
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
