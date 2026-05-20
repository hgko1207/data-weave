"use client";

import Link from "next/link";
import { Apple, Beef, Fish, Leaf, Wheat } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORY_LABEL } from "@/widgets/price/catalog";
import {
  PRICE_CATEGORIES,
  PRICE_CLS,
  type PriceCategory,
  type PriceCls,
} from "@/widgets/price/schema";

const CATEGORY_ICONS: Record<PriceCategory, LucideIcon> = {
  grain: Wheat,
  vegetable: Leaf,
  fruit: Apple,
  meat: Beef,
  seafood: Fish,
};

const CLS_LABEL: Record<PriceCls, string> = {
  retail: "소매",
  wholesale: "도매",
};

export type PriceFilterValues = {
  category: PriceCategory;
  cls: PriceCls;
};

export function PriceFilters({ current }: { current: PriceFilterValues }) {
  const buildHref = (overrides: Partial<PriceFilterValues>) => {
    const category = overrides.category ?? current.category;
    const cls = overrides.cls ?? current.cls;
    const params = new URLSearchParams({ category });
    if (cls !== "retail") params.set("cls", cls);
    return `/w/price?${params.toString()}`;
  };

  return (
    <section className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-5">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        검색 조건
      </p>

      {/* 부류 chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">부류</span>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_CATEGORIES.map((cat) => {
            const active = cat === current.category;
            const Icon = CATEGORY_ICONS[cat];
            return (
              <Link
                key={cat}
                href={buildHref({ category: cat })}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  active
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {CATEGORY_LABEL[cat]}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 소매/도매 토글 */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">구분</span>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_CLS.map((cls) => {
            const active = cls === current.cls;
            return (
              <Link
                key={cls}
                href={buildHref({ cls })}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  active
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                {CLS_LABEL[cls]}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
