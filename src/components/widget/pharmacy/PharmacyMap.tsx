"use client";

import { KakaoMap, type MapMarker } from "@/components/kakao-map";
import type { SosData } from "@/widgets/pharmacy/schema";

// 약국·응급실 mini 지도. PharmacyDetail과 동일한 필터를 적용해 일관된 결과.
// 응급실=rose / 약국=emerald, 사용자 위치=cyan dot (origin).
export function PharmacyMap({
  data,
  kindFilter,
  openNowFilter = false,
}: {
  data: SosData;
  kindFilter: "all" | "pharmacy" | "er";
  openNowFilter?: boolean;
}) {
  let filtered = data.list;
  if (kindFilter !== "all") filtered = filtered.filter((f) => f.kind === kindFilter);
  if (openNowFilter) filtered = filtered.filter((f) => f.isOpenNow === "open");

  if (filtered.length === 0) return null;

  const markers: MapMarker[] = filtered.map((f) => ({
    id: `${f.kind}-${f.name}-${f.lat.toFixed(4)}`,
    lat: f.lat,
    lng: f.lng,
    color: f.kind === "er" ? "rose" : "emerald",
  }));

  return (
    <section aria-label="약국·응급실 지도">
      <KakaoMap markers={markers} origin={data.origin} />
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          약국
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          응급실
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-cyan-400/40" />
          내 위치
        </span>
      </div>
    </section>
  );
}
