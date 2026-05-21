"use client";

import { weatherConfigSchema } from "./schema";
import { WEATHER_REGIONS as REGIONS } from "./regions";
import type { WidgetConfig } from "../_types";

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
          className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
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
          className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
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
