"use client";

import Link from "next/link";
import { Apple, Beef, Fish, Leaf, Wheat } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATALOG, CATEGORY_LABEL } from "@/widgets/price/catalog";
import type { PriceCategory, PriceItem } from "@/widgets/price/schema";

const CATEGORY_ICONS: Record<PriceCategory, LucideIcon> = {
  vegetable: Leaf,
  fruit: Apple,
  meat: Beef,
  seafood: Fish,
  grain: Wheat,
};

export type PriceFilterValues = {
  category: PriceCategory;
  itemId: string;
};

export function PriceFilters({
  current,
  catalog,
}: {
  current: PriceFilterValues;
  catalog: PriceItem[];
}) {
  const buildHref = (overrides: Partial<PriceFilterValues>) => {
    const cat = overrides.category ?? current.category;
    const item = overrides.itemId ?? current.itemId;
    const params = new URLSearchParams({ category: cat });
    if (item) params.set("item", item);
    return `/w/price?${params.toString()}`;
  };

  return (
    <section className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-5">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        검색 조건
      </p>

      {/* 카테고리 chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">카테고리</span>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATALOG) as PriceCategory[]).map((cat) => {
            const active = cat === current.category;
            const Icon = CATEGORY_ICONS[cat];
            return (
              <Link
                key={cat}
                href={buildHref({ category: cat, itemId: CATALOG[cat][0].id })}
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

      {/* 품목 chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">품목</span>
        <div className="flex flex-wrap gap-1.5">
          {catalog.map((item) => {
            const active = item.id === current.itemId;
            return (
              <Link
                key={item.id}
                href={buildHref({ itemId: item.id })}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  active
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
