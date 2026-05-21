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

### 표면 (Background) — Phase 1.5 솔리드 모델

> ⚠️ Phase 1 초기 안(반투명 + Aurora bg)은 사용자 피드백("사이드바/메인 구분 안 됨")으로 폐기. 현재는 솔리드 surface + 명확한 border. §14 참조.

| Layer | Tailwind | Hex | 용도 |
|-------|----------|-----|------|
| L0 page | `bg-zinc-950` | `#09090b` | 메인 영역 배경 |
| L1 chrome | `bg-zinc-900` + `border-zinc-800/80` | `#18181b` | 사이드바, 헤더, 위젯 카드 (불투명) |
| L2 inset | `bg-zinc-950/60` + `border-zinc-800` | `#09090b` 60% | 카드 안의 입력/chip/시간대 mini card |
| Modal/Dialog bg | `bg-zinc-950` | `#09090b` | 다이얼로그 |

**원칙:** 반투명·backdrop-blur 남용 금지. 솔리드 + 명확한 경계선이 다크 톤에서 더 읽힘.

### (deprecated) 옛 표면 토큰
| 역할 | Tailwind | 비고 |
|------|----------|------|
| ~~Aurora gradient~~ | `bg-gradient-to-br from-slate-950 via-zinc-950 to-black` | §7 deprecated |
| ~~Card bg~~ | `bg-zinc-900/60 backdrop-blur` | L1으로 교체 |
| ~~Card border~~ | `border border-white/5` | `border-zinc-800/80`로 교체 |

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

### 범주형 인코딩 색 (Phase 1.5+)

> 위젯 데이터를 *카테고리*로 분류해 색으로 구분할 때 쓰는 팔레트. emerald/cyan/amber/rose 기본 액센트로 부족할 때(범주가 5개 이상)만 pink/violet/blue/yellow/red까지 확장한다. **새 범주 색이 필요하면 여기에 등록 후 재사용** — 위젯마다 즉흥적으로 새 색조를 만들지 말 것.

| 도메인 | 범주 → 색 | 칩 클래스 패턴 |
|--------|-----------|----------------|
| 관광 (tour) | 자연=emerald · 문화=cyan · 축제=amber · 레저=pink · 쇼핑=violet | `bg-{hue}-500/15 text-{hue}-300` |
| 로또 공 (lotto) | 1~10=yellow · 11~20=blue · 21~30=red · 31~40=zinc · 41~45=emerald | `bg-{hue}-500 text-{hue}-950` 또는 `text-zinc-50` (동행복권 공식 색 — 도메인 예외) |

**원칙:** 범주형 색은 의미(분류)를 전달할 때만. 장식 목적의 색 추가 금지. 텍스트는 순백(`text-white`) 대신 `text-zinc-50`/`text-{hue}-950` 사용.

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

## 7. ~~Aurora Background~~ (Deprecated, Phase 1.5)

> ⚠️ **사용 안 함.** Phase 1.5에서 솔리드 surface(§2)로 교체. 사용자 피드백 "사이드바/메인 구분 안 됨" → opaque chrome으로 해결. 컴포넌트 파일은 `src/components/aurora-bg.tsx`에 남아있으나 root layout에서 제거됨. 새 작업에서 사용 X.

옛 안 (참고용):

```tsx
// src/components/aurora-bg.tsx (deprecated)
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

## 12. Phase 1 Design Patches (`/plan-design-review` 결과)

7-pass 압축 리뷰로 도출된 추가 결정·자동 fix 모음. DESIGN.md §1~§11과 함께 SSOT.

### 12.1 위젯 카드 내부 시선 위계 (Pass 1)

```
1순위: 핵심 데이터 값      (text-3xl font-mono font-bold) — "-3.2°C" / "5km 내 3곳" / "0건"
2순위: 위젯 제목 + 아이콘  (text-lg font-semibold, 좌상단)
3순위: 보조 데이터          (text-xs font-mono text-zinc-400)
4순위: HealthDot           (우상단, 무음 정상 상태)
5순위: 액션 버튼            (refresh, expand)
```

**원칙:** 사용자가 카드 봤을 때 0.5초 안에 1순위 값 인지. Mono + 큰 폰트가 anchor.

### 12.2 추가 인터랙션 상태 (Pass 2)

**RefreshBtn 5상태:**

| State | Tailwind |
|-------|----------|
| idle | `text-zinc-500` |
| hover | `text-zinc-300 bg-white/5` |
| active (pressed) | `scale-95 transition` |
| spinning (fetch 중) | `animate-spin text-emerald-400` |
| disabled (debounce) | `text-zinc-700 cursor-not-allowed` |

**Partial / Edge 상태:**

| 상황 | UI 표현 |
|------|--------|
| SOS 위치 권한 거부 | 기본 좌표(서울 시청) 사용 + 카드 상단 amber `<Banner>` "위치 켜면 더 정확" + amber HealthDot |
| 위젯 0개 첫 진입 | `<EmptyDashboard>` Hero — Aurora 위 큰 카피 "어떤 데이터를 받아볼까요?" + "+ 첫 위젯 추가" emerald CTA |
| 새로고침 빠른 연타 | debounce 500ms, 두 번째 클릭부터 disabled |

### 12.3 User Journey & Time-Horizon Design (Pass 3)

**5초 / 5분 / 5년 horizon (Norman):**

| Horizon | 사용자 인지 | 디자인이 지지 |
|---------|------------|------------|
| 5초 (visceral) | "이거 좀 다르네, 진짜 같다" | Aurora gradient + Mono 큰 숫자 + Cmd+K 힌트 |
| 5분 (behavioral) | "어 빠르네 + 변화 보이네" | First Run Magic 1초 + Diff 색표시 + health dot |
| 5년 (reflective) | "내 일상에 박힘" | 일관된 디자인, 변화 없는 안정감, 6개월 후도 동일 톤 |

**6단계 User Journey:**

```
STEP | USER DOES                        | FEELS    | DESIGN SUPPORTS
─────|──────────────────────────────────|──────────|────────────────────────────
  1  | 첫 진입 (빈 dashboard)            | 호기심    | Aurora + Hero 빈 상태 + 큰 CTA
  2  | 카탈로그 둘러봄                   | 기대     | 카드 hover에 데이터 미리보기
  3  | 첫 위젯 추가                      | 만족     | First Run Magic 1초 → Mono 큰 숫자 fade-in
  4  | 매일 새로고침 1회                  | 안심     | health dot 녹색, refresh 가벼운 spin
  5  | PWA 설치 (3번째 방문 trigger)      | 깊은 관계 | iOS install 가이드 또는 Chrome A2HS
  6  | 6개월 후                          | 일상      | 일관된 디자인, "왜 안 봤지" 후회 없음
```

### 12.4 AI Slop 차별화 (Pass 4) — Generic Card Grid 회피

**위젯 그리드는 일반 SaaS dashboard와 다음 4가지가 다름:**

1. **Aurora bg** — 카드 *사이의 공기*가 다름. 일반 SaaS는 white/gray flat.
2. **Mono 데이터** — 큰 숫자가 카드의 anchor. 일반 SaaS는 본문체 + 작은 그래프.
3. **Live HealthDot** — 카드가 "살아있다"는 신호. 일반 SaaS는 정적.
4. **Diff 색표시** — 새로고침 시 변화가 보임. 일반 SaaS는 silent refresh.

이 4가지 중 어느 하나라도 빠지면 위젯 그리드는 generic SaaS로 회귀. Phase 1 구현 시 **모두 포함 필수.**

**Aurora 가드레일:** §7의 Aurora bg는 emerald-500/10 + cyan-500/10 blur-3xl, 반드시 *2개만, 10% opacity 이하*. 더 추가하면 "decorative blob slop"으로 추락.

**Emoji 가드레일:** ✨/✅ 등 emoji는 *빈 상태에서만, 카드당 1회 한정*. 헤더·버튼·본문에 emoji 금지.

### 12.5 위젯-토큰 매핑 (Pass 5)

| 요소 | DESIGN.md 토큰 |
|------|--------------|
| 위젯 카드 bg | `bg-zinc-900/60 backdrop-blur` |
| 카드 border | `border border-white/5` |
| 카드 shadow | `shadow-md shadow-black/30 hover:shadow-xl hover:shadow-black/40` |
| 카드 radius | `rounded-xl` |
| 핵심 데이터 (값) | `text-3xl font-mono font-bold text-zinc-100` |
| 위젯 제목 | `text-lg font-semibold text-zinc-100` |
| 보조 데이터 | `text-xs font-mono text-zinc-400` |
| HealthDot 정상 | `bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/50 motion-safe:animate-pulse` |
| HealthDot 경고 | `bg-amber-400 shadow-[0_0_8px] shadow-amber-400/50` |
| HealthDot 에러 | `bg-rose-400 shadow-[0_0_8px] shadow-rose-400/50` |
| Diff 새 항목 | `text-emerald-400 bg-emerald-950/30 px-1.5 rounded` |
| Diff 사라짐 | `line-through text-zinc-500` |

### 12.6 위젯별 모바일 변환 (<768px) (Pass 6)

| 위젯 | 모바일 변환 |
|------|-----------|
| 날씨 | 시간대별 mini graph: `overflow-x-auto snap-x` 가로 스크롤. 메인 온도는 그대로 큰 mono. |
| SOS 병원/약국 | 병원 리스트: 1열 stacked. 거리 right-align mono. 전화 버튼 full-width emerald. |
| 위해식품 리콜 | 키워드 필터 `sticky top-16` (헤더 아래). 항목 카드 1열. |

### 12.7 헤더 로고 스펙 (결정 1)

```tsx
// src/app/(dashboard)/layout.tsx 헤더
<a href="/" aria-label="DataWeave 홈" className="flex items-center gap-1.5">
  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400/60" />
  <span className="text-base font-semibold tracking-tight text-zinc-100">
    DataWeave
  </span>
</a>
```

**원칙:** Wordmark 단일. Inter Bold + tracking-tight. 좌측에 emerald dot (3x3px 정도, 살짝 glow). 디자인 비용 0, 식별 명확. Linear/Vercel 톤.

### 12.8 PWA Install Prompt 트리거 (결정 2)

**조건 (AND):**
- 사용자 visit count ≥ 3 (localStorage `dataweave.visits`)
- 활성 위젯 인스턴스 ≥ 1
- 이전 dismiss 후 7일 경과 (`dataweave.pwa.dismissedAt`)
- `beforeinstallprompt` event 사용 가능 (Chrome/Edge)

**iOS:** `beforeinstallprompt` 미지원 → 같은 조건 만족 시 "iOS 안내" banner: "공유 → 홈 화면에 추가"

**Banner UI:**
```tsx
<aside className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96
                  rounded-xl bg-zinc-900/95 border border-emerald-500/20
                  p-4 shadow-2xl backdrop-blur">
  <p className="text-sm text-zinc-100">DataWeave를 홈 화면에 추가할까요?</p>
  <p className="text-xs text-zinc-400 mt-1">한 번 클릭으로 앱처럼 열립니다.</p>
  <div className="flex gap-2 mt-3">
    <Button size="sm" variant="default">설치</Button>
    <Button size="sm" variant="ghost">나중에</Button>
  </div>
</aside>
```

**Dismiss 규칙:** 클릭 시 `dismissedAt = now`, 7일 후 재표시. "나중에"는 부드럽게.

---

## 14. Phase 1.5 Design Evolution

> 사용자 피드백 + audit/arrange/typeset/polish 라운드를 통해 Phase 1 디자인이 진화한 결과. 옛 토큰은 deprecated 표시하고 새 결정만 정리.

### 14.1 톤 — Supabase + shadcn 솔리드

Aurora gradient + 반투명 카드 → **솔리드 zinc surface + 명확한 경계선**. Linear-tier 밀도 + shadcn 정갈함. Material Design 풍 부유 그림자/큰 둥근 모서리는 피함.

### 14.2 버튼 시스템 (canonical)

| 종류 | 클래스 | 용도 |
|------|--------|------|
| Primary (emerald) | `bg-emerald-500 text-zinc-950 hover:bg-emerald-400` | CTA, 검색 submit |
| Ghost zinc | `border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800` | 보조 액션 (대시보드 가기, 위젯 관리 등) |
| Chip (inactive) | `border border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100` | 필터 chip 비활성 |
| Chip (active) | `border border-emerald-500/30 bg-emerald-500/15 text-emerald-200` | 필터 chip 활성 (기본 emerald 톤) |
| Chip (toned active) | rose/amber/zinc 변형 | 등급 필터 같이 의미별 톤 (1=rose, 2=amber, 3=zinc) |
| Star (북마크 활성) | `border-amber-400/40 bg-amber-400/10 text-amber-200` + `fill-amber-300` | 즐겨찾기 활성 |
| Touch target | 최소 `h-9` (36px) — chip은 `h-8` (32px) 허용 | A11y |

### 14.3 타이포 강화 (text-[10px] 금지)

| 토큰 | 용도 |
|------|------|
| `text-3xl font-semibold tracking-tight` | 페이지 h1 (PageFrame 자동) |
| `text-base font-semibold` | 카드 제목 |
| `text-base` | 본문 강조 + dl 값 |
| `text-sm` | 본문, 라벨 |
| `text-xs font-mono uppercase tracking-[0.14em]` | eyebrow / 섹션 라벨 (모노) — **최소 사이즈** |
| `font-mono tabular-nums` | 숫자/데이터 (°C, %, 거리, 금액 등) — 본문에 절대 X |

**금지:**
- `text-[10px]` — 다크에서 시인성 부족. eyebrow도 `text-xs` 하한.
- `text-zinc-600` 이하 본문 — `text-zinc-400`/`text-zinc-500`만.
- 본문에 mono.

### 14.4 컴포넌트 빌딩 블록

| 컴포넌트 | 위치 | 역할 |
|----------|------|------|
| `<PageFrame>` | `src/components/page-frame.tsx` | 모든 페이지 헤더 (eyebrow + h1 + description + actions). 새 페이지 직접 헤더 만들지 X |
| `<BaseWidget>` / `<DashboardWidget>` | `src/components/widget/` | 위젯 카드. 새 위젯에서 절대 직접 카드 스타일 X |
| `<DashboardStats>` | `src/components/dashboard-stats.tsx` | 대시보드 상단 4-up 통계 strip |
| `<Sidebar>` / `<SidebarContent>` / `<SidebarBookmarks>` | `src/components/sidebar/` | 좌측 영구 네비 (w-64) |
| `<BookmarkButton>` | `src/components/bookmark/` | 페이지 헤더 ★ 즐겨찾기 토글 |
| `<CommandPalette>` | `src/components/command-palette.tsx` | ⌘K (cmdk) |
| `getSkyVisual(skyText)` | `src/components/widget/weather/sky-icon.ts` | 날씨 텍스트 → Lucide 아이콘 + 색상 |

### 14.5 차트 패턴 (SVG line + area)

- 사이즈: viewBox `0 0 600 160`, `preserveAspectRatio="none"`, `min-w-full overflow-x-auto`
- Line: `stroke="rgb(52, 211, 153)" strokeWidth="2" strokeLinecap="round"` (emerald-400)
- Area fill: `<linearGradient>` emerald-400 0.25 → 0
- Point dots: `r="3.5" fill="rgb(20, 20, 23)" stroke="rgb(52, 211, 153)" strokeWidth="2"`
- 라벨: `fontSize="11"`, mono via `className="fill-zinc-300 font-mono"`
- Trend pill (▲/▼/보합): rose/cyan/zinc + `font-mono text-xs`

(예시: `src/components/widget/apartment/ApartmentTrendChart.tsx`)

### 14.6 사이드바 패턴

```
┌── DataWeave (D-chip + wordmark + tagline)
│
├── 대시보드
│
├── ★ 즐겨찾기 (mounted 후 표시, 빈 리스트면 숨김)
│   - 라벨 + 별표 + hover 시 X 제거 버튼
│
├── 공공데이터 (섹션 라벨, registry-driven)
│   - 날씨 / SOS 병원·약국 / 식품 리콜 / 아파트 실거래가 / ...
│
└── 설정 (footer)
    + 데이터 소스 상태 pill (4/4 연결됨)
```

- 너비 고정 `w-64` (반응형 collapse 시도 → 사용자 피드백으로 폐기, 항상 표시)
- Active 메뉴: `bg-emerald-500/10 text-emerald-200` + 아이콘 chip emerald-500/15
- 호버: `hover:bg-zinc-800/60 hover:text-zinc-100`

### 14.7 검색 상태 = URL searchParams

위젯 상세 페이지에서 클라이언트 상태 없음:
- 필터 chip은 `<Link href={...}>` 또는 `router.push` (`useRouter`)
- 사용자가 chip 클릭 → URL 갱신 → RSC 재 fetch → 새 결과 렌더
- 효과: 새로고침/공유/북마크 친화

(예시: `src/components/widget/apartment/ApartmentFilters.tsx`)

### 14.8 필터 chip 색 매핑 (의미별 톤)

- **기본 emerald**: 일반 필터 (기간, 종류, 정렬)
- **rose**: 1등급 (식품 리콜 최고 위험)
- **amber**: 2등급 / 경고
- **zinc**: 3등급 / 약한 위험
- **amber-star**: 즐겨찾기 활성

위젯 데이터의 의미(위험도)가 chip 색에도 반영되어 한눈에 분류 가능.

---

## 13. 디자인 변경 이력

| 날짜 | 변경 |
|------|------|
| 2026-05-04 | 최초 작성. Emerald + Cyan 액센트 + Aurora bg + JetBrains Mono 데이터 |
| 2026-05-05 | §12 Phase 1 Design Patches 추가 — `/plan-design-review` 7-pass: 카드 IA, 인터랙션 상태, User Journey 5초/5분/5년, Slop 차별화 4가지, 위젯-토큰 매핑, 모바일 변환, 로고 wordmark, PWA install prompt 트리거 |
| 2026-05-16 | **§14 Phase 1.5 Design Evolution 추가**. Aurora bg + 반투명 surface 폐기 → Supabase/shadcn 톤 솔리드 surface로 교체. 옛 표면 토큰 deprecated 표시. 버튼 시스템 (Primary/Ghost-zinc/Chip with semantic tones) 정리. 타이포 하한 `text-xs`, `text-[10px]` 금지. PageFrame/사이드바/즐겨찾기/SVG 차트 패턴 정리. 검색 상태 = URL searchParams 컨벤션 명문화. |
