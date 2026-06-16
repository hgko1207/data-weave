# 우리 동네 지도 대시보드 (Map-centric View)

> 현재 DataWeave는 **위젯 카드 그리드** 모델 — 각 위젯이 자기 페이지 안에서 1지역 1주제 표시. 이 계획은 그 위에 **지도 중심 뷰**를 얹어, 한국 지도에서 직접 지역을 클릭하면 그 지역의 위젯 데이터가 한눈에 떠오르는 새 진입 경로를 만든다.

**한 줄 가치**: "위젯을 골라 들어가는" 게 아니라 "지도에서 지역을 짚고 모든 걸 본다."

**중요**: 기존 위젯들을 *대체*하지 않는다 — 지도가 위젯의 layer/관문이 된다. 기존 카드 그리드/사이드바/즐겨찾기 동시 유지.

---

## 큰 그림: 제품 재구성

| 현재 | 목표 |
|------|------|
| 사이드바 → 위젯 선택 → 지역 입력 → 결과 | 지도 → 지역 클릭 → 위젯 panel 자동 표시 |
| 1지역 = 1위젯 = 1페이지 | 1지역 = 다수 위젯 동시 |
| 단방향 (위젯 → 데이터) | 양방향 (지도 ↔ 위젯) |

**라우트 추가**: `/map` — 신규. 사이드바 최상단 "지도"로 진입.

**기존 위젯 페이지(`/w/<id>`)는 유지** — 직접 위젯 깊이 보고 싶을 때 그쪽으로.

---

## Phase 분할 (한 번에 다 안 함)

| Phase | 범위 | 기간 | 데이터 라이브 |
|-------|------|------|-------------|
| **1. 정적 지도 + 시·도 마커** | 17개 시·도 마커, 클릭 시 해당 시·도의 위젯 페이지로 navigate | 1주 | 없음 (탐색용) |
| **2. 마커 위 핵심 지표 1개** | 마커에 현재 기온 + 미세먼지 등급 (정적 빌드 데이터) | 1주 | KMA + AirKorea (build-time fetch + ISR) |
| **3. 클릭 → 사이드 패널** | 클릭 시 우측에 그 지역의 위젯 미리보기 카드 (날씨/대기/응급실/실거래가 요약) | 2주 | 지역별 다중 fetch (요청 시) |
| **4. 시·군·구 zoom + 실시간 layers** | 줌인 시 시·군·구 마커, 강수 레이더 토글 등 | 2주+ | 더 무거운 데이터 |

Phase 1만으로도 "한국 지도 위에서 시·도를 시각적으로 선택"이라는 새 진입 경로가 됨 — 출하 가능.

---

## 기술 결정 트리

### 지도 라이브러리

| 옵션 | 장점 | 단점 | 추천 |
|------|------|------|------|
| **카카오맵 SDK** | 한국 특화, 무료, 풍부한 한국 행정구역 데이터 | JS 외부 스크립트 (PWA 캐싱 까다로움) | ⭐ Phase 1~3 |
| Leaflet + OpenStreetMap | 오픈소스, npm install, SSR 친화 | 한국 행정구역 GeoJSON 별도 필요, 마커 스타일 자유도 ↓ | 차선 |
| Mapbox | 가장 예쁨, 풍부한 styling | 월 5만 view 초과 시 유료 | 비추 (개인용) |
| 자체 SVG 한국 지도 | 가벼움, 의존 0, 디자인 자유 | 인터랙션(줌·드래그) 직접 구현 | **Phase 1만 자체 SVG 추천** |

**최종 추천**:
- **Phase 1**: 자체 SVG 한국 지도 (17개 시·도 path) — 의존 0, 가볍고 우리 디자인 톤(zinc-900 + emerald)에 그대로 녹임. SVG path는 오픈 데이터로 1회 다운.
- **Phase 2~3**: 카카오맵 SDK로 전환 — 시·군·구 zoom, 위치 기반 위젯이 필요해질 때.

자체 SVG로 시작 → 검증되면 카카오맵으로. **앞부터 카카오 끼우는 함정 피하기.**

### 멀티 지역 fetch 전략

17개 시·도 × 5개 위젯 = 85 API 호출. 단순 요청 시마다 호출하면 무거움.

**Phase 2 권장**: **Build-time fetch + ISR**
- `revalidate: 600` (10분) — Next.js ISR로 지도 페이지 데이터 캐싱
- Vercel 빌드 시 17개 시·도 × 핵심 1~2개 지표만 fetch
- 새로고침해도 캐시 hit, 10분마다 재생성
- KMA 일일 쿼터(1만/일) 안전

**Phase 3 권장**: **Lazy load on click**
- 시·도 클릭 시 그 지역만 추가 fetch (다른 위젯들)
- 클릭 안 한 지역은 fetch 안 함 — 호출 90% 절약

### 좌표·행정구역 데이터

기존 위젯에 흩어져 있음:
- `apartment/lawd-codes.ts` — 시·도/시·군·구 매핑
- `pharmacy/sido-centers.ts` — 시·도 좌표
- `weather/regions.ts` — 시·도 + KMA nx/ny

**Phase 1~2**: 위 데이터 그대로 재사용. 17개 시·도 + 약간의 시·군·구만 필요.

**Phase 4**: 전국 시·군·구 GeoJSON 도입 — `data.go.kr` 또는 공공데이터 GeoJSON으로 1회 다운로드 후 정적 자산화.

---

## 화면 구성

### Phase 1 — `/map`

```
┌─────────────────────────────────────────────────┐
│ 한국 공공데이터 지도                    [범례 ?]   │
├─────────────────────────────────────────────────┤
│                                                 │
│           ┌──┐                                  │
│         ┌─┘ ◯└─┐  ← 마커(시·도)                  │
│         │   ◯  │     클릭 → /w/weather?region=시도  │
│         └◯  ◯ ─┘                               │
│         ◯  ◯ ◯                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

- 사이드바 그대로
- 헤더 그대로
- 메인 영역에 한국 SVG 지도 전체 화면
- 마커: 단순 emerald 원 + 시·도명 (호버 시 강조)
- 클릭: 그 시·도의 weather 페이지로 navigate (가장 자주 보는 위젯 가정)

### Phase 2 — 마커에 지표

```
        ┌──┐
      ┌─┘ ◯└─┐
      │  20°/보통
      │ ◯  서울                ← 마커가 작은 카드로
      │ 23°/좋음                  현재 기온 + 미세먼지 등급
      │   대전
```

색: 미세먼지 등급에 따라 마커 테두리 색 (emerald/cyan/amber/rose). 글자는 mono.

### Phase 3 — 클릭 시 사이드 패널

```
┌─────────────────────┬───────────────────┐
│                     │ 대전광역시         │
│      [지도]          │ ────────────────  │
│                     │ 🌤 23°C 구름많음   │
│                     │ 🚨 위급재난 0건     │
│   ◯ 클릭됨           │ 🏥 응급실 11곳    │
│                     │ 🏠 매매 3.8억(평균)│
│                     │ [날씨 자세히 →]    │
└─────────────────────┴───────────────────┘
```

기존 위젯 페이지의 핵심 1줄 요약을 모은 panel. "자세히" 링크로 위젯 페이지 진입.

### Phase 4 — Zoom + Layers

- 시·도 줌인 → 시·군·구 마커
- 우측 상단 토글: "강수 레이더", "재난 layers", "응급실 layers"

---

## 새 컴포넌트 구조

```
src/app/(dashboard)/map/page.tsx          # /map 라우트 (RSC)
src/components/map/
  KoreaMap.tsx                            # SVG 한국 지도 (또는 카카오맵 wrapper)
  SidoMarker.tsx                          # 마커 컴포넌트 (지표 포함)
  RegionPanel.tsx                         # 클릭 시 우측 패널 (Phase 3)
  RegionSnapshot.tsx                      # 1 지역의 위젯 요약 카드 (Phase 3)
src/widgets/_aggregate.ts                 # 다중 위젯 fetch 헬퍼 (Phase 3)
public/korea-sido.svg                     # SVG 한국 지도 자산 (Phase 1)
```

### 다중 fetch 헬퍼

```ts
// src/widgets/_aggregate.ts
export async function fetchRegionSnapshot(sido: string) {
  const [weather, disaster, pharmacy] = await Promise.allSettled([
    fetchWeather({ config: { ..., regionName: sido }, ... }),
    fetchDisaster({ config: { ..., sido }, ... }),
    fetchPharmacy({ config: { ..., sido }, ... }),
  ]);
  return { weather, disaster, pharmacy };
}
```

`Promise.allSettled` — 1개 실패해도 나머지는 표시.

---

## 사이드바 변경

`/map` 진입을 상단에 추가:

```
DataWeave (D 칩)
─────────────
🗺  지도        ← 신규 (최상단)
📊  대시보드
─────────────
생활·안전
  날씨 / 약국 / 식품리콜 / 재난문자 / 지원금
부동산
  매매 / 전월세
문화·여가
  도서관 / 관광 / 로또
가격
  농수산물 시세
─────────────
설정
```

`WIDGET_META`와 별개 — 사이드바 PRIMARY 섹션에 추가.

---

## Phase별 구현 순서

### Phase 1 (1주)
1. Korea SVG asset 준비 (한국 17개 시·도 GeoJSON → SVG path 변환, 1회 작업)
2. `src/components/map/KoreaMap.tsx` — SVG 렌더, 마커 위치, hover state
3. `src/app/(dashboard)/map/page.tsx` — `/map` 라우트
4. 사이드바 "지도" 항목 추가
5. 마커 클릭 → `/w/weather?region=...` 이동 (기존 weather 페이지로)
6. 모바일 대응 (지도 viewport 조정)

### Phase 2 (1주)
7. `src/app/(dashboard)/map/page.tsx`에 build-time fetch — 17개 시·도 weather + airkorea
8. `revalidate: 600`
9. 마커 컴포넌트에 지표 표시 (기온 + 미세먼지 등급)
10. 마커 색 → 등급 색 매핑

### Phase 3 (2주)
11. URL state `?region=` 추가 — 클릭 시 query 갱신
12. `RegionPanel` 사이드 패널 (모바일은 bottom drawer)
13. `fetchRegionSnapshot` 헬퍼 + `Promise.allSettled`
14. 위젯별 요약 카드 (`RegionSnapshot`) — 4-6개 위젯
15. ISR/SWR로 패널 데이터 캐싱

### Phase 4+ (2주~)
16. 카카오맵 SDK로 전환 (zoom·드래그 필요해지면)
17. 시·군·구 GeoJSON 도입
18. Layer 토글 (강수 레이더 등)

---

## 인프라 재사용

| 부분 | 출처 |
|------|------|
| 시·도/시·군·구 매핑 | `apartment/lawd-codes.ts` |
| 시·도 좌표 | `pharmacy/sido-centers.ts` |
| KMA nx/ny | `weather/regions.ts` |
| 위젯별 fetch | 기존 `src/widgets/<id>/fetch.ts` 그대로 |
| 사이드바 그룹 색 | 기존 `content-backdrop.tsx` 패턴 |
| 카드 디자인 | 기존 위젯 컴포넌트 일부 차용 (`StatCard`, `BaseWidget`) |

신규: SVG 지도 + 마커 + 패널만.

---

## 리스크·미해결

- **SVG path 데이터 정확성**: 행정구역 경계가 실제 지도와 약간 어긋날 수 있음. 단순화된 path면 OK (시각적 식별만).
- **다중 fetch latency**: Phase 3에서 4-6 위젯 동시 fetch → 1~2초. ISR로 캐싱, skeleton UX 필요.
- **모바일 지도 인터랙션**: 작은 화면에서 17개 마커가 겹침 → 클러스터링 또는 시·도 selector fallback 고려.
- **공공데이터 쿼터**: Phase 2에서 17개 시·도 × 2 위젯 빌드 시 34 호출 — 10분마다 ISR이면 일 5천 호출. KMA 1만/일 쿼터 안전 — 하지만 모니터링 필요.
- **위젯 단위 구조와의 결**: 지도 뷰가 위젯 페이지의 단순 진입경로인가, 별도 모드인가? **답: 별도 진입경로**. 위젯 페이지는 지금 그대로.

---

## 완성 정의 (Phase 1)

- [ ] `/map` 라우트 진입 시 한국 SVG 지도 렌더
- [ ] 17개 시·도 마커 표시 + 호버 시 시·도명 강조
- [ ] 마커 클릭 시 해당 시·도 weather 페이지로 navigate
- [ ] 모바일에서도 지도 표시 (스크롤·줌 없이 한 화면)
- [ ] 사이드바 "지도" 항목 활성화
- [ ] 다크 톤(zinc-900 배경 + emerald 마커) 디자인 일관성

---

## 시작 전 결정 사항 (사용자 확인 필요)

- [ ] SVG vs 카카오맵 — 위 추천대로 SVG 시작?
- [ ] 마커 클릭 시 어느 위젯으로? — weather(기본 추천)? 혹은 위젯 chooser?
- [ ] Phase 1만 먼저 출하 후 사용 데이터 보고 Phase 2 결정? (점진적)
- [ ] 모바일에서 지도 UX — 단순 표시? 시·도 selector로 fallback?
