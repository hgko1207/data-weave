"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { foodRecallConfigSchema } from "./schema";
import type { WidgetConfig } from "../_types";

const COMMON = ["우유", "계란", "땅콩", "견과", "메밀", "밀", "갑각류", "복숭아"];

export function FoodRecallConfigForm({
  value,
  onChange,
}: {
  value: WidgetConfig;
  onChange: (v: WidgetConfig) => void;
}) {
  const cfg = foodRecallConfigSchema.parse(value);
  const [draft, setDraft] = useState("");

  const addKeyword = (raw: string) => {
    const kw = raw.trim();
    if (!kw) return;
    if (cfg.allergyKeywords.includes(kw)) return;
    onChange({ ...cfg, allergyKeywords: [...cfg.allergyKeywords, kw] });
  };

  const removeKeyword = (kw: string) => {
    onChange({
      ...cfg,
      allergyKeywords: cfg.allergyKeywords.filter((k) => k !== kw),
    });
  };

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
          placeholder="예: 우리집"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-zinc-400">알레르기 / 관심 키워드</span>
        <div className="flex flex-wrap gap-1.5">
          {cfg.allergyKeywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 rounded bg-emerald-950/40 px-2 py-0.5 font-mono text-[11px] text-emerald-300"
            >
              {kw}
              <button
                type="button"
                aria-label={`${kw} 제거`}
                onClick={() => removeKeyword(kw)}
                className="text-emerald-400/60 hover:text-emerald-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {cfg.allergyKeywords.length === 0 ? (
            <span className="text-[11px] text-zinc-500">키워드 미설정 — 모든 리콜 표시</span>
          ) : null}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            placeholder="키워드 입력 후 Enter"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addKeyword(draft);
                setDraft("");
              }
            }}
            className="flex-1 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {COMMON.filter((k) => !cfg.allergyKeywords.includes(k)).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => addKeyword(k)}
              className="rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-white/10"
            >
              + {k}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-400">
          기간 <span className="font-mono text-zinc-300">{cfg.windowHours}시간</span>
        </span>
        <input
          type="range"
          min={6}
          max={168}
          step={6}
          defaultValue={cfg.windowHours}
          onChange={(e) =>
            onChange({ ...cfg, windowHours: Number(e.target.value) })
          }
          className="accent-emerald-500"
        />
      </label>
    </form>
  );
}
