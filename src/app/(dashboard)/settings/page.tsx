"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { WIDGET_META, type WidgetMeta } from "@/widgets/_metadata";
import { DEFAULT_PINNED, readPinned, writePinned } from "@/lib/pinned-widgets";

export default function SettingsPage() {
  const [pinned, setPinned] = useState<string[] | null>(null);

  useEffect(() => {
    setPinned(readPinned());
  }, []);

  const toggle = (id: string) => {
    setPinned((cur) => {
      if (!cur) return cur;
      const next = cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id];
      writePinned(next);
      return next;
    });
  };

  const reset = () => {
    setPinned(DEFAULT_PINNED);
    writePinned(DEFAULT_PINNED);
  };

  return (
    <PageFrame
      eyebrow="settings"
      title="설정"
      description="대시보드에 표시할 위젯을 선택하세요. 사이드바 메뉴에선 선택과 무관하게 모든 위젯에 접근할 수 있습니다."
      actions={
        pinned ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 items-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            기본값으로
          </button>
        ) : null
      }
    >
      <section className="space-y-3">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          대시보드 위젯
        </h2>
        <ul className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/50 backdrop-blur divide-y divide-white/[0.06]">
          {WIDGET_META.map((widget) => (
            <PinRow
              key={widget.id}
              widget={widget}
              pinned={pinned ? pinned.includes(widget.id) : true}
              loading={pinned === null}
              onToggle={() => toggle(widget.id)}
            />
          ))}
        </ul>
      </section>
    </PageFrame>
  );
}

function PinRow({
  widget,
  pinned,
  loading,
  onToggle,
}: {
  widget: WidgetMeta;
  pinned: boolean;
  loading: boolean;
  onToggle: () => void;
}) {
  const Icon: LucideIcon = widget.icon;
  return (
    <li className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.02]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
        <Icon className="h-4 w-4 text-emerald-400" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-100">{widget.title}</p>
        <p className="truncate text-xs text-zinc-500">{widget.description}</p>
      </div>
      <Toggle on={pinned} disabled={loading} onChange={onToggle} label={`${widget.title} 핀`} />
    </li>
  );
}

function Toggle({
  on,
  disabled,
  onChange,
  label,
}: {
  on: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
        on ? "bg-emerald-500" : "bg-zinc-700"
      }`}
    >
      <span
        aria-hidden
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          on ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
