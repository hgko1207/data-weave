"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
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
    <section className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">설정</h1>
        <p className="mt-1 text-sm text-zinc-400">
          대시보드에 표시할 위젯을 선택하세요. 사이드바 메뉴에선 선택과 무관하게 모든
          위젯에 접근할 수 있습니다.
        </p>
      </header>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            대시보드 위젯
          </h2>
          {pinned ? (
            <button
              type="button"
              onClick={reset}
              className="text-xs text-zinc-500 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              기본값으로
            </button>
          ) : null}
        </div>
        <ul className="divide-y divide-white/5 rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur">
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
      </div>
    </section>
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
    <li className="flex items-center gap-3 p-4">
      <Icon className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
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
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
        on ? "bg-emerald-500" : "bg-zinc-700"
      }`}
    >
      <span
        aria-hidden
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          on ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
