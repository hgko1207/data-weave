"use client";

import Link from "next/link";
import { WEATHER_REGIONS } from "@/widgets/weather/regions";

export function RegionPicker({ active }: { active: string }) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-4">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        지역
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {WEATHER_REGIONS.map((r) => {
          const isActive = r.regionName === active;
          return (
            <li key={r.regionName}>
              <Link
                href={`/w/weather?region=${encodeURIComponent(r.regionName)}`}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  isActive
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                {r.regionName}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
