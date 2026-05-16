"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { isBookmarked, subscribeBookmarks, toggleBookmark } from "@/lib/bookmarks";

type Props = {
  label: string;
  widgetId: string;
};

export function BookmarkButton({ label, widgetId }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [href, setHref] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const qs = searchParams.toString();
    const full = qs ? `${pathname}?${qs}` : pathname;
    setHref(full);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!href) return;
    const sync = () => setActive(isBookmarked(href));
    sync();
    return subscribeBookmarks(sync);
  }, [href]);

  if (!href) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-600"
      >
        <Star className="h-3.5 w-3.5" aria-hidden />
        즐겨찾기
      </button>
    );
  }

  const onClick = () => {
    const { active: nextActive } = toggleBookmark({ label, href, widgetId });
    setActive(nextActive);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
        active
          ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
          : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
      }`}
    >
      <Star
        className={`h-3.5 w-3.5 ${active ? "fill-amber-300 text-amber-300" : ""}`}
        aria-hidden
      />
      {active ? "즐겨찾기 됨" : "즐겨찾기"}
    </button>
  );
}
