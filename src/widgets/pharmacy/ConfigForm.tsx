"use client";

import { Crosshair } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { pharmacyConfigSchema } from "./schema";
import type { WidgetConfig } from "../_types";

const SIDOS = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원특별자치도",
  "충청북도",
  "충청남도",
  "전북특별자치도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
];

export function PharmacyConfigForm({
  value,
  onChange,
}: {
  value: WidgetConfig;
  onChange: (v: WidgetConfig) => void;
}) {
  const cfg = pharmacyConfigSchema.parse(value);
  const geo = useGeolocation();

  return (
    <form className="space-y-3 text-sm" onSubmit={(e) => e.preventDefault()}>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-400">별칭 (선택)</span>
        <input
          type="text"
          defaultValue={cfg.nickname ?? ""}
          maxLength={20}
          onChange={(e) => onChange({ ...cfg, nickname: e.target.value || undefined })}
          className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          placeholder="예: 집 근처"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-400">시·도</span>
          <select
            defaultValue={cfg.sido}
            onChange={(e) => onChange({ ...cfg, sido: e.target.value })}
            className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            {SIDOS.map((s) => (
              <option key={s} value={s} className="bg-zinc-900">
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-400">시·군·구</span>
          <input
            type="text"
            defaultValue={cfg.sigungu}
            onChange={(e) => onChange({ ...cfg, sigungu: e.target.value })}
            className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            placeholder="예: 유성구"
          />
        </label>
      </div>

      <div className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-zinc-400">위도</span>
          <input
            type="number"
            step="0.0001"
            defaultValue={cfg.lat}
            onChange={(e) => onChange({ ...cfg, lat: Number(e.target.value) })}
            className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 font-mono text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-zinc-400">경도</span>
          <input
            type="number"
            step="0.0001"
            defaultValue={cfg.lng}
            onChange={(e) => onChange({ ...cfg, lng: Number(e.target.value) })}
            className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 font-mono text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            geo.request();
            if (geo.coords) onChange({ ...cfg, ...geo.coords });
          }}
          disabled={geo.status === "requesting"}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/5 bg-white/5 px-2.5 text-xs text-zinc-200 hover:bg-white/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <Crosshair className="h-3.5 w-3.5" aria-hidden />
          내 위치
        </button>
      </div>
      {geo.status === "error" ? (
        <p className="text-xs text-amber-400">{geo.error}</p>
      ) : null}
      {geo.status === "success" && geo.coords ? (
        <p className="font-mono text-[11px] text-emerald-400">
          {geo.coords.lat.toFixed(4)}, {geo.coords.lng.toFixed(4)} — 위도/경도에 채워졌습니다
        </p>
      ) : null}

      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-400">
          반경 <span className="font-mono text-zinc-300">{cfg.radiusKm}km</span>
        </span>
        <input
          type="range"
          min={1}
          max={20}
          step={1}
          defaultValue={cfg.radiusKm}
          onChange={(e) => onChange({ ...cfg, radiusKm: Number(e.target.value) })}
          className="accent-emerald-500"
        />
      </label>
    </form>
  );
}
