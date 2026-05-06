"use client";

import { weatherConfigSchema, type WeatherConfig } from "./schema";
import type { WidgetConfig } from "../_types";

const REGIONS: Array<Pick<WeatherConfig, "regionName" | "nx" | "ny" | "sidoName">> = [
  { regionName: "서울", nx: 60, ny: 127, sidoName: "서울" },
  { regionName: "부산", nx: 98, ny: 76, sidoName: "부산" },
  { regionName: "대구", nx: 89, ny: 90, sidoName: "대구" },
  { regionName: "인천", nx: 55, ny: 124, sidoName: "인천" },
  { regionName: "광주", nx: 58, ny: 74, sidoName: "광주" },
  { regionName: "대전", nx: 67, ny: 100, sidoName: "대전" },
  { regionName: "울산", nx: 102, ny: 84, sidoName: "울산" },
  { regionName: "수원", nx: 60, ny: 121, sidoName: "경기" },
  { regionName: "청주", nx: 69, ny: 106, sidoName: "충북" },
  { regionName: "전주", nx: 63, ny: 89, sidoName: "전북" },
  { regionName: "춘천", nx: 73, ny: 134, sidoName: "강원" },
  { regionName: "제주", nx: 53, ny: 38, sidoName: "제주" },
];

export function WeatherConfigForm({
  value,
  onChange,
}: {
  value: WidgetConfig;
  onChange: (v: WidgetConfig) => void;
}) {
  const cfg = weatherConfigSchema.parse(value);

  return (
    <form className="space-y-3 text-sm" onSubmit={(e) => e.preventDefault()}>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-400">별칭 (선택)</span>
        <input
          type="text"
          defaultValue={cfg.nickname ?? ""}
          maxLength={20}
          onChange={(e) =>
            onChange({ ...cfg, nickname: e.target.value || undefined })
          }
          className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          placeholder="예: 출근길"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-400">지역</span>
        <select
          defaultValue={cfg.regionName}
          onChange={(e) => {
            const r = REGIONS.find((it) => it.regionName === e.target.value);
            if (r) onChange({ ...cfg, ...r });
          }}
          className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          {REGIONS.map((r) => (
            <option key={r.regionName} value={r.regionName} className="bg-zinc-900">
              {r.regionName}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
