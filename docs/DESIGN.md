# DataWeave — Design System

> 다크 모드 기반 세련된 SaaS. Linear의 디테일감 + Vercel의 미니멀 + 한국 공공데이터의 신선함을 결합. Slop 회피를 1급 가치로.
>
> 모든 토큰은 `tailwind.config.ts`에 반영하고, 코드보다 토큰을 신뢰합니다.

---

## 1. 디자인 원칙

1. **공간이 콘텐츠다.** 다크 SaaS의 고급감은 여백과 호흡에서 나온다. 위젯 카드 사이 24px+ gap.
2. **데이터는 모노스페이스.** 시간/숫자/거리/온도 같은 데이터는 `JetBrains Mono`. 본문은 `Inter`. 시각적 위계 강제.
3. **하나의 액센트, 하나의 서브.** Emerald가 메인 (성공·알림·CTA), Cyan이 서브 (데이터 강조). 그 외 색은 정보 의미만 (warning/error).
4. **움직임은 의미를 말한다.** 무의미한 트랜지션 0. 변화 감지·새 알림·로딩에만 애니메이션.
5. **빈 상태는 기능이다.** Empty state마다 톤이 다르다 (캠핑장: 기다림 ✨ / 리콜: 안심 ✅).
6. **A11y는 마감재가 아니라 골조다.** WCAG AA, 키보드 nav, reduced-motion 처음부터.

---

## 2. 컬러 팔레트

### 표면 (Background)
| 역할 | Tailwind | Hex |
|------|----------|-----|
| Page bg base | `bg-zinc-950` | `#09090b` |
| Aurora gradient | `bg-gradient-to-br from-slate-950 via-zinc-950 to-black` | (gradient) |
| Card bg | `bg-zinc-900/60 backdrop-blur` | `#18181b` w/ alpha |
| Card border | `border border-white/5` | `rgba(255,255,255,0.05)` |
| Modal/Dialog bg | `bg-zinc-950` | `#09090b` |

### 텍스트
| 역할 | Tailwind | Hex |
|------|----------|-----|
| Primary | `text-zinc-100` | `#f4f4f5` |
| Secondary | `text-zinc-400` | `#a1a1aa` |
| Tertiary/muted | `text-zinc-500` | `#71717a` |
| Disabled | `text-zinc-600` | `#52525b` |

### 액센트 (시그니처)
| 역할 | Tailwind | Hex |
|------|----------|-----|
| Primary accent | `text-emerald-400` `bg-emerald-500` | `#34d399` / `#10b981` |
| Primary hover | `bg-emerald-400` | `#34d399` |
| Primary muted bg | `bg-emerald-950/30` | `rgba(6,78,59,0.3)` |
| Secondary accent | `text-cyan-400` `bg-cyan-500` | `#22d3ee` / `#06b6d4` |
| Focus ring | `ring-emerald-500/50` | `rgba(16,185,129,0.5)` |

### 시맨틱
| 역할 | Tailwind | Hex |
|------|----------|-----|
| Success | `text-emerald-400` | `#34d399` |
| Warning | `text-amber-400` | `#fbbf24` |
| Error | `text-rose-400` | `#fb7185` |
| Info | `text-cyan-400` | `#22d3ee` |

### Diff 색 표시 (D2)
| 역할 | Tailwind |
|------|----------|
| 새로 추가됨 | `text-emerald-400 bg-emerald-950/30 px-1.5 rounded` |
| 사라짐 | `line-through text-zinc-500` |
| 수정됨 | `text-amber-400 bg-amber-950/20` |

---

## 3. 타이포그래피

### Font 패밀리
```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Geist Mono', ui-monospace, monospace;
```
Next.js `next/font/google`로 self-host. layout.tsx에서 정의.

### 사이즈 스케일

| Token | Tailwind | px | 용도 |
|-------|----------|----|----|
| `text-xs` | 12px | label, badge, mono caption |
| `text-sm` | 14px | secondary copy, button |
| `text-base` | 16px | body |
| `text-lg` | 18px | card title |
| `text-xl` | 20px | section heading |
| `text-2xl` | 24px | page title |
| `text-3xl` | 30px | hero number (위젯 큰 데이터, mono) |

### Weight
- Body: `font-normal` (400)
- UI / button: `font-medium` (500)
- Heading: `font-semibold` (600)
- Hero number: `font-bold` (700) + `font-mono`

### Mono 액센트 — 어디에 쓸까
- 시간 표시 (`14:32`, `30분 전`)
- 온도/거리/가격 숫자 (`-3.2°C`, `1.4km`, `₩4,500`)
- 캠핑장 날짜 (`2026-07-19`)
- 위젯 health 카운터 (`98.2%` 성공률)
- API endpoint 표시 (admin 영역)

본문, 카드 제목, 버튼 라벨에는 절대 mono 안 씀. 데이터에만.

---

## 4. Spacing & Sizing

Tailwind 기본 스케일 (4px 그리드) 따름.
- 카드 내부 패딩: `p-5` (20px) 또는 `p-6` (24px)
- 카드 간격: `gap-6` (24px)
- 페이지 패딩: `px-6 lg:px-8`
- 헤더 높이: `h-16` (64px)

### Touch target
- 버튼 최소: `h-10 w-10` (40px) — shadcn 디폴트, A11y 권장 44 근접
- 모바일 인터랙션 영역은 `min-h-11 min-w-11` 사용

---

## 5. Radius

| Token | Tailwind | px | 용도 |
|-------|----------|----|----|
| Small | `rounded` | 4px | badge, tag |
| Medium | `rounded-lg` | 8px | button, input, dropdown item |
| Card | `rounded-xl` | 12px | 위젯 카드, dialog |
| Pill | `rounded-full` | n/a | avatar, status dot |

---

## 6. Shadow

| Token | Tailwind | 용도 |
|-------|----------|------|
| Card | `shadow-md shadow-black/30` | 위젯 카드 기본 |
| Card hover | `shadow-xl shadow-black/40` | hover 상승감 |
| Modal | `shadow-2xl shadow-black/60` | dialog, command palette |
| Glow (active) | `shadow-lg shadow-emerald-500/20` | 새 알림 받은 위젯 카드 강조 (3초 후 fade) |

---

## 7. Aurora Background (Slop 회피 핵심)

```tsx
// src/components/aurora-bg.tsx
export function AuroraBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-zinc-950 to-black" />
      <div
        aria-hidden
        className="absolute -top-40 -right-40 h-[40rem] w-[40rem] rounded-full
                   bg-emerald-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-40 h-[40rem] w-[40rem] rounded-full
                   bg-cyan-500/10 blur-3xl"
      />
      {/* 미세한 노이즈 텍스처 (선택) */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.015]"
        style={{ backgroundImage: 'url(/noise.png)' }}
      />
    </div>
  );
}
```

루트 레이아웃에서 `<AuroraBg />`를 한 번 렌더하고 메인 콘텐츠는 그 위에. 모바일에서도 가벼움 (CSS만, 60fps).

---

## 8. Live Status Dot

```tsx
// src/components/widget/WidgetHealthDot.tsx
type Health = 'healthy' | 'warning' | 'error';

export function WidgetHealthDot({ status }: { status: Health }) {
  const colors = {
    healthy: 'bg-emerald-400 shadow-emerald-400/50',
    warning: 'bg-amber-400 shadow-amber-400/50',
    error: 'bg-rose-400 shadow-rose-400/50',
  };
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={`Widget status: ${status}`}
      className={`relative inline-block h-2 w-2 rounded-full ${colors[status]}
                  shadow-[0_0_8px] motion-safe:animate-pulse`}
    />
  );
}
```

`prefers-reduced-motion` 사용자에게는 pulse 없음 (Tailwind `motion-safe:` 자동).

---

## 9. 애니메이션 정책

| 케이스 | 애니메이션 | reduced-motion |
|-------|-----------|---------------|
| 새 알림 도착 | 카드 `shadow` glow 3초 fade | 색만 변경, glow 없음 |
| Diff 새 항목 | `bg-emerald-950/30` 6초 fade out | 정적 표시 |
| Loading | shadcn Skeleton (shimmer) | shimmer 없음 |
| Live status dot | `animate-pulse` | static |
| Modal/Dialog | shadcn 기본 (fade + scale) | fade only |

전역 CSS:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. 위젯 카드 비주얼 샘플

```tsx
<Card className="rounded-xl border border-white/5 bg-zinc-900/60
                 p-6 shadow-md shadow-black/30 backdrop-blur
                 transition-shadow hover:shadow-xl hover:shadow-black/40">
  <header className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <CloudSun className="h-5 w-5 text-emerald-400" />
      <h3 className="text-lg font-semibold text-zinc-100">날씨</h3>
    </div>
    <div className="flex items-center gap-2">
      <WidgetHealthDot status="healthy" />
      <button className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300
                         hover:bg-white/5 focus-visible:ring-2
                         focus-visible:ring-emerald-500/50">
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  </header>

  <div className="mt-4 flex items-baseline gap-2">
    <span className="font-mono text-3xl font-bold text-zinc-100">-3.2°C</span>
    <span className="text-sm text-zinc-400">대전 · 흐림</span>
  </div>

  <div className="mt-2 flex gap-3 text-xs">
    <span className="text-cyan-400">강수확률 <span className="font-mono">20%</span></span>
    <span className="text-amber-400">미세먼지 <span className="font-mono">나쁨</span></span>
  </div>
</Card>
```

---

## 11. A11y 체크리스트

- [ ] 모든 interactive 요소 키보드 접근 (Tab/Shift-Tab/Enter/Space)
- [ ] `focus-visible:ring-2 ring-emerald-500/50` 모든 button/input/link
- [ ] 위젯 카드 `aria-label` (위젯 이름 + 상태)
- [ ] Live status dot `role="status" aria-live="polite"`
- [ ] 색만으로 정보 전달 금지 (Diff는 색 + `+` `-` 텍스트 prefix)
- [ ] 색대비 ≥ 4.5:1 (zinc-100 on zinc-950 ✅, zinc-400 on zinc-900 ✅)
- [ ] 모든 이미지 `alt`
- [ ] `prefers-reduced-motion` 존중
- [ ] 모바일 터치 타겟 ≥ 44×44px

---

## 12. 디자인 변경 이력

| 날짜 | 변경 |
|------|------|
| 2026-05-04 | 최초 작성. Emerald + Cyan 액센트 + Aurora bg + JetBrains Mono 데이터 |
