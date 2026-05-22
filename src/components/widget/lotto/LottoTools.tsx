"use client";

import { useEffect, useState } from "react";
import { Dices, Save, Trash2, Wand2 } from "lucide-react";
import { LottoBall } from "./LottoBall";

const STORAGE_KEY = "dataweave.lotto.mynumbers";

type SavedSet = {
  id: string;
  numbers: number[];
  createdAt: number;
};

type Props = {
  // 현재 회차 당첨번호 — 내 번호 대조용
  round: number;
  winNumbers: number[];
  bonus: number;
};

export function LottoTools({ round, winNumbers, bonus }: Props) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Generator />
      <MyNumbers round={round} winNumbers={winNumbers} bonus={bonus} />
    </div>
  );
}

// ── 번호 생성기 ─────────────────────────────────────────────
function Generator() {
  const [sets, setSets] = useState<number[][]>([]);

  const generate = () => {
    setSets(Array.from({ length: 5 }, () => generateBalanced()));
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = (numbers: number[]) => {
    appendSaved(numbers);
    window.dispatchEvent(new Event("dataweave-lotto-changed"));
  };

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <Wand2 className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              번호 생성기
            </p>
            <p className="text-sm font-medium text-zinc-100">균형 잡힌 무작위 5세트</p>
          </div>
        </div>
        <button
          type="button"
          onClick={generate}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-xs font-medium text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <Dices className="h-4 w-4" aria-hidden />
          다시 뽑기
        </button>
      </header>

      <ul className="mt-5 space-y-2.5">
        {sets.map((nums, i) => (
          <li key={i} className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {nums.map((n) => (
                <LottoBall key={n} num={n} size="sm" />
              ))}
            </div>
            <button
              type="button"
              onClick={() => save(nums)}
              aria-label="이 번호 저장"
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 font-mono text-xs text-zinc-300 transition hover:border-emerald-500/40 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              <Save className="h-3 w-3" aria-hidden />
              저장
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-zinc-500">
        홀짝 균형(2~4개)과 합계(100~175) 범위를 고려한 무작위입니다. 당첨 확률을 높이진 못하지만
        고르게 분포된 조합을 뽑아줍니다.
      </p>
    </article>
  );
}

// ── 내 번호 + 당첨 대조 ─────────────────────────────────────
function MyNumbers({
  round,
  winNumbers,
  bonus,
}: {
  round: number;
  winNumbers: number[];
  bonus: number;
}) {
  const [saved, setSaved] = useState<SavedSet[]>([]);

  useEffect(() => {
    const sync = () => setSaved(readSaved());
    sync();
    window.addEventListener("dataweave-lotto-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("dataweave-lotto-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const remove = (id: string) => {
    const next = readSaved().filter((s) => s.id !== id);
    writeSaved(next);
    setSaved(next);
    window.dispatchEvent(new Event("dataweave-lotto-changed"));
  };

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-6">
      <header className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-500/15 text-amber-400">
          <Save className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            내 번호
          </p>
          <p className="text-sm font-medium text-zinc-100">{round}회 당첨번호와 대조</p>
        </div>
      </header>

      {saved.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-500">
          생성기에서 마음에 드는 번호를 <span className="text-zinc-300">저장</span>하면 여기서 회차별
          당첨 여부를 자동으로 대조해드려요.
        </p>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {saved.map((s) => {
            const result = checkRank(s.numbers, winNumbers, bonus);
            return (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-2.5"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  {s.numbers.map((n) => (
                    <LottoBallMatched
                      key={n}
                      num={n}
                      matched={winNumbers.includes(n)}
                      bonus={n === bonus}
                    />
                  ))}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${result.tone}`}
                  >
                    {result.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(s.id)}
                    aria-label="삭제"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs leading-relaxed text-zinc-500">
        저장한 번호는 이 브라우저에만 보관됩니다. {round}회 당첨번호 기준으로 등수를 계산해요.
      </p>
    </article>
  );
}

function LottoBallMatched({
  num,
  matched,
  bonus,
}: {
  num: number;
  matched: boolean;
  bonus: boolean;
}) {
  if (matched || bonus) {
    return (
      <span className="relative">
        <LottoBall num={num} size="sm" />
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-zinc-900"
        />
      </span>
    );
  }
  return (
    <span className="opacity-40">
      <LottoBall num={num} size="sm" />
    </span>
  );
}

// ── 로직 ────────────────────────────────────────────────────
function generateBalanced(): number[] {
  for (let attempt = 0; attempt < 40; attempt++) {
    const nums = pick6();
    const sum = nums.reduce((a, b) => a + b, 0);
    const odd = nums.filter((n) => n % 2 === 1).length;
    if (sum >= 100 && sum <= 175 && odd >= 2 && odd <= 4) return nums;
  }
  return pick6();
}

function pick6(): number[] {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 6).sort((a, b) => a - b);
}

function checkRank(
  my: number[],
  win: number[],
  bonus: number,
): { label: string; tone: string } {
  if (win.length !== 6) {
    return { label: "대조 불가", tone: "bg-zinc-800 text-zinc-400" };
  }
  const matches = my.filter((n) => win.includes(n)).length;
  const hasBonus = my.includes(bonus);
  if (matches === 6) return { label: "1등", tone: "bg-amber-500/20 text-amber-200" };
  if (matches === 5 && hasBonus) return { label: "2등", tone: "bg-amber-500/15 text-amber-300" };
  if (matches === 5) return { label: "3등", tone: "bg-emerald-500/15 text-emerald-300" };
  if (matches === 4) return { label: "4등", tone: "bg-cyan-500/15 text-cyan-300" };
  if (matches === 3) return { label: "5등", tone: "bg-cyan-500/10 text-cyan-300" };
  return { label: `${matches}개`, tone: "bg-zinc-800 text-zinc-500" };
}

function readSaved(): SavedSet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedSet[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSaved(sets: SavedSet[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

function appendSaved(numbers: number[]): void {
  const cur = readSaved();
  // 중복(같은 번호 조합) 방지
  const key = [...numbers].sort((a, b) => a - b).join(",");
  if (cur.some((s) => [...s.numbers].sort((a, b) => a - b).join(",") === key)) return;
  const next: SavedSet[] = [
    { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, numbers, createdAt: Date.now() },
    ...cur,
  ].slice(0, 20);
  writeSaved(next);
}
