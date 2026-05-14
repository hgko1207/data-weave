"use client";

import { useMemo, useState } from "react";
import { apartmentConfigSchema } from "./schema";
import { getSigunguListWithCode, LAWD_BY_SIDO } from "./lawd-codes";
import type { WidgetConfig } from "../_types";

const SIDOS = Object.keys(LAWD_BY_SIDO);

export function ApartmentConfigForm({
  value,
  onChange,
}: {
  value: WidgetConfig;
  onChange: (v: WidgetConfig) => void;
}) {
  const cfg = apartmentConfigSchema.parse(value);
  const [sido, setSido] = useState(cfg.sido);
  const sigunguOptions = useMemo(() => getSigunguListWithCode(sido), [sido]);

  return (
    <form className="space-y-3 text-sm" onSubmit={(e) => e.preventDefault()}>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-zinc-400">별칭 (선택)</span>
        <input
          type="text"
          defaultValue={cfg.nickname ?? ""}
          maxLength={20}
          onChange={(e) =>
            onChange({ ...cfg, nickname: e.target.value || undefined })
          }
          className="h-10 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          placeholder="예: 우리 동네"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-zinc-400">시·도</span>
          <select
            value={sido}
            onChange={(e) => {
              const next = e.target.value;
              setSido(next);
              const list = getSigunguListWithCode(next);
              const first = list[0];
              if (first) {
                onChange({ ...cfg, sido: next, sigungu: first.name, lawdCd: first.code });
              }
            }}
            className="h-10 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            {SIDOS.map((s) => (
              <option key={s} value={s} className="bg-zinc-900">
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-zinc-400">시·군·구</span>
          <select
            value={cfg.sigungu}
            onChange={(e) => {
              const next = e.target.value;
              const match = sigunguOptions.find((o) => o.name === next);
              if (match) onChange({ ...cfg, sigungu: match.name, lawdCd: match.code });
            }}
            className="h-10 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            {sigunguOptions.map((sg) => (
              <option key={sg.code} value={sg.name} className="bg-zinc-900">
                {sg.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </form>
  );
}
