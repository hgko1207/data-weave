"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, X } from "lucide-react";
import { readBookmarks, removeBookmark, subscribeBookmarks, type Bookmark } from "@/lib/bookmarks";

export function SidebarBookmarks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBookmarks(readBookmarks());
    return subscribeBookmarks(() => setBookmarks(readBookmarks()));
  }, []);

  if (!mounted || bookmarks.length === 0) return null;

  // 새 항목이 위로
  const sorted = [...bookmarks].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mb-4">
      <div className="mb-1.5 mt-5 flex items-center gap-2 px-2.5">
        <Star className="h-3 w-3 text-amber-400" aria-hidden />
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
          즐겨찾기
        </span>
      </div>
      <ul className="space-y-px">
        {sorted.map((b) => {
          const active = pathname + (typeof window !== "undefined" ? window.location.search : "") === b.href;
          return (
            <li key={b.id} className="group relative">
              <Link
                href={b.href}
                onClick={onNavigate}
                title={b.label}
                className={`flex items-center gap-2.5 rounded-md py-2 pl-2.5 pr-8 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  active
                    ? "bg-emerald-500/10 text-emerald-200"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                }`}
              >
                <Star
                  className="h-3.5 w-3.5 shrink-0 fill-amber-300/80 text-amber-300/80"
                  aria-hidden
                />
                <span className="truncate">{b.label}</span>
              </Link>
              <button
                type="button"
                aria-label={`${b.label} 즐겨찾기 제거`}
                onClick={(e) => {
                  e.preventDefault();
                  removeBookmark(b.href);
                }}
                className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-zinc-800 hover:text-zinc-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
