"use client";

import { Phone, MapPin, Pill, Stethoscope } from "lucide-react";
import type { Facility, SosData } from "./schema";

export function PharmacyRender({ data }: { data: SosData }) {
  if (data.list.length === 0) {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-zinc-300">반경 {data.radiusKm}km 내 운영 중인 곳이 없어요.</p>
        <p className="text-xs text-zinc-400">
          시군구나 반경을 넓혀보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-zinc-100">
          {data.list.length}
        </span>
        <span className="text-sm text-zinc-400">
          곳 · {data.region} · 반경 <span className="font-mono">{data.radiusKm}km</span>
        </span>
      </div>

      <ul className="divide-y divide-white/5">
        {data.list.slice(0, 5).map((f) => (
          <FacilityRow key={`${f.kind}-${f.name}-${f.lat.toFixed(4)}`} f={f} />
        ))}
      </ul>

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function FacilityRow({ f }: { f: Facility }) {
  const Icon = f.kind === "pharmacy" ? Pill : Stethoscope;
  const kakaoUrl = `https://map.kakao.com/link/map/${encodeURIComponent(f.name)},${f.lat},${f.lng}`;
  return (
    <li className="flex items-start gap-3 py-2.5">
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${f.kind === "pharmacy" ? "text-emerald-400" : "text-cyan-400"}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium text-zinc-100">{f.name}</p>
          <span className="shrink-0 font-mono text-xs text-zinc-400">
            {f.distanceKm.toFixed(1)}km
          </span>
        </div>
        <p className="truncate text-xs text-zinc-400">{f.address}</p>
        {f.hoursToday ? (
          <p className="font-mono text-xs text-zinc-400">오늘 {f.hoursToday}</p>
        ) : null}
        <div className="mt-1.5 flex gap-1.5">
          {f.phone ? (
            <a
              href={`tel:${f.phone.replace(/\D+/g, "")}`}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              <Phone className="h-3 w-3" aria-hidden />
              <span className="font-mono">{f.phone}</span>
            </a>
          ) : null}
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <MapPin className="h-3 w-3" aria-hidden />
            지도
          </a>
        </div>
      </div>
    </li>
  );
}
