# DataWeave — TODOS (Phase 2+)

> Phase 1에서 의도적으로 deferred한 항목들. 의식적으로 미룬 것이지 잊은 것 아님.
>
> 우선순위: P1 (다음 분기) / P2 (6개월 내) / P3 (시간 남으면)
> 개발 비용: 사람 기준 → CC + gstack 기준
>
> 본 문서는 `/plan-ceo-review` SCOPE EXPANSION 모드에서 도출. 2026-05-04.

---

## TODO 1 — 자연어 위젯 생성 (Claude API)

**What.** "대전 보라매 체육관 빈자리 나오면 알려줘" 같은 자연어 입력 → LLM이 등록된 데이터 소스 중 매칭, 조건·채널이 채워진 위젯 정의 초안 생성.

**Why.** 이 프로젝트의 시그니처 차별화 기능 후보. 비개발자(가족, 친구)가 위젯 만들 수 있게 하는 "마지막 1마일."

**Pros.** 한국 공공데이터 활용 진입장벽을 0에 가깝게. 마켓플레이스 시드 자동 생성 가능. 화제성 큼.

**Cons.** Claude API 비용 (사용자별 Rate limiting 필요). 환각으로 잘못된 위젯 만들 위험 (반드시 사용자 confirm 단계 필요). 등록된 소스 N개 적을 때는 유용성 낮음.

**Context.** Phase 1엔 위젯 4개·데이터 소스 4개라 도구로서 가치 작음. 위젯 6~8개 + 소스 다양화 후 추가가 합리적. Anthropic SDK 사용 + prompt caching으로 비용 압축. 프롬프트는 `lib/llm/widget-builder.ts`에 격리.

**Effort.** 사람 M (3~5일) → CC ~3시간

**Priority.** P2

**Depends on / blocks.** 데이터 소스 6개+ 등록 선행. 마켓플레이스(TODO 3) 의존.

---

## TODO 2 — 다중 사용자 + Auth + RLS

**What.** Supabase Auth (email + Google OAuth) 추가. 모든 테이블에 RLS 정책. `user_id` non-null 마이그레이션. 가족·친구 초대 플로우.

**Why.** Phase 1 데이터 모델은 이미 멀티 유저 호환 (`user_id` 컬럼 nullable). Auth 켜는 순간 RLS 4줄로 격리 완성. 가족이 본인의 워치를 구독·공유하는 경로 열림 → "공공데이터 알림 OS" 비전 실현.

**Pros.** 차터의 12개월 비전 핵심. 데이터 모델 변경 거의 0. PWA + 멀티 디바이스 자연스러움.

**Cons.** 익명 → 인증 사용자 마이그레이션 절차 필요 (Phase 1 데이터 보존). Supabase Free Tier MAU 한도 (50K). 침해 시 영향 범위 확대.

**Context.** Phase 1 single-user는 인증 오버헤드 회피용 의도적 선택. RLS 4정책 (read own widgets, write own widgets, read own snapshots, read own notifications). 마이그레이션 SQL은 `supabase/migrations/0010_auth.sql` 등으로 분리.

**Effort.** 사람 L (1주) → CC ~2시간

**Priority.** P1 (Phase 1 안정 후 첫 confirm)

**Depends on / blocks.** Supabase Auth 활성화. TODO 3 (워치 갤러리) 차단 해제.

---

## TODO 3 — 워치 갤러리 / 공유 가능한 위젯

**What.** 사용자가 만든 위젯 정의(`config` JSON)를 공유 가능한 형식으로 export/import. "이 위젯 갤러리에 게시" 버튼. 다른 사용자 위젯을 1클릭 구독.

**Why.** 차터 비전의 platform potential. 잘 만든 캠핑장 위젯을 친구가 동일 조건으로 즉시 구독. 새 데이터 소스를 *코드 수정 없이* 갤러리 PR로 추가 가능 (오픈소스 경로).

**Pros.** Network effect. 위젯 정의가 데이터(코드 X)라 가능. 한국 공공데이터 위젯 갤러리 = 시드 자체로 콘텐츠.

**Cons.** 공유 위젯의 보안 (XSS in nickname?), 모더레이션, 스팸 위젯. 위젯 정의 schema 표준화 작업 필요.

**Context.** Phase 1 위젯 정의는 이미 JSON 직렬화 가능 (`config: jsonb`). 표준화 위해 zod schema를 위젯별로 export. 갤러리는 별도 `gallery_widgets` 테이블 + 평점/구독자수.

**Effort.** 사람 L (1~2주) → CC ~4시간

**Priority.** P2

**Depends on / blocks.** TODO 2 (다중 사용자) 필수.

---

## TODO 4 — 체육시설 취소표 모니터링 (사용자 원본 아이디어)

**What.** 지자체 시설관리공단 사이트(예: 대전, 서울 각 구) 크롤링 → 예약 가능 슬롯 변화 감지 → 알림형 위젯으로 통합.

**Why.** 사용자 원본 프롬프트의 Phase 1 후보였음. PMF가 매우 강한 영역 (광클 시장). Phase 1엔 법적/기술적 리스크 때문에 제외했지만 대전 등 지자체 *한 곳*만 정성스럽게 도전 가치 있음.

**Pros.** 진짜 사용자 가치 (현재 카페·오픈채팅 수동 공유 수준). 차별화 강함.

**Cons.** 공식 API 거의 없음 → Puppeteer/Playwright 크롤링. 사이트 약관 위반 가능성 (게시 전 확인 필수). reCAPTCHA·IP 차단. Vercel Serverless 부적합 → 별도 워커 (Fly.io / Railway / 가정용 서버) 필요. 사이트 변경 시 깨짐 → 유지보수 부담.

**Context.** 별도 워커 프로세스로 분리하여 Phase 1 인프라와 격리. `services/badminton-crawler/` 신규 디렉토리. 데이터 소스로서 위젯 인터페이스에 *기존과 동일하게* 흡수 (`fetch`가 외부 워커 결과 조회).

**Effort.** 사람 XL (2~3주, 사이트별) → CC ~6시간 + 운영 부담 영구

**Priority.** P3 (위험 대비 reward 신중히 평가)

**Depends on / blocks.** 별도 워커 인프라 결정 (Fly.io vs 자가 서버).

---

## TODO 5 — 스마트홈 트리거 (Webhook out)

**What.** 위젯의 `alerting`이 알림 전송 외에 Webhook도 호출 가능하게. 사용자가 SmartThings/Home Assistant Webhook URL 등록 → 날씨 위젯이 "1시간 뒤 비 + 미세먼지 나쁨" 감지 시 IoT 액션 트리거.

**Why.** 사용자 원본 프롬프트 11번 아이디어 자연 흡수. 단순 알림을 넘어 *물리 액션*까지 확장 = 차터 비전의 "platform" 정의 완성.

**Pros.** 마니아 시장에 강력한 어필. 추가 데이터 모델 거의 0 (push_subs에 channel='webhook' 추가만).

**Cons.** 사용자 Webhook URL의 SSRF 위험 (private IP 차단 필요). 디버깅 어려움 (외부 시스템).

**Context.** dispatcher 인터페이스에 `webhook` 채널 추가. URL allowlist (특정 도메인) 또는 SSRF 가드 (private IP/localhost 차단). 처음엔 SmartThings/HA 두 개만 화이트리스트.

**Effort.** 사람 S (2~3일) → CC ~1.5시간

**Priority.** P2

**Depends on / blocks.** 없음 (Phase 1 위에 직접 추가 가능).

---

## TODO 6 — 착한가격업소 + 지역화폐 위젯

**What.** 행정안전부 OpenAPI로 사용자 주변 착한가격업소 + 지역사랑상품권 가맹점 교집합을 지도에 표시.

**Why.** 데이터는 풍부한데 활용이 거의 없는 영역 = 차별화 기회. 생활밀착 가치 (외식비 절감). 조회형 위젯이라 인프라 추가 0.

**Pros.** 시장에 경쟁자 거의 없음. 데이터 무료. 사용자 *진짜 매일 씀* 가능성.

**Cons.** 지도 컴포넌트 의존 (Naver Map / Kakao Map / Mapbox). 지자체별 데이터 갱신 빈도 불균등.

**Context.** Phase 1 SOS 병원/약국 위젯이 이미 지도를 사용한다면 동일 컴포넌트 재사용. Kakao Map 권장 (한국 데이터 매칭 좋음). 위젯 ID `cheap-stores`.

**Effort.** 사람 M (1주) → CC ~2시간

**Priority.** P2

**Depends on / blocks.** 지도 컴포넌트 결정 (전역 영향).

---

## TODO 7 — 위젯 Health 자세히 보기 페이지

**What.** 위젯별 health 상세 페이지: 7/30일 폴링 성공률 그래프, 평균 응답 시간 추이, 최근 실패 사유 리스트, 알림 전송 이력 타임라인.

**Why.** Phase 1엔 위젯 카드의 status dot만 있음. 사용자가 의심할 때 (왜 알림 안 와? 왜 데이터 이상해?) 디버깅 가능한 곳 필요. SCOPE EXPANSION D8 채택분의 깊은 버전.

**Pros.** 사용자 trust 증대. 운영자(본인)에게도 가치 큼. 위젯 정의 디버깅 도구.

**Cons.** 그래프 라이브러리 추가 (recharts/visx). UI 복잡도 증가.

**Context.** `app/(dashboard)/widgets/[id]/health/page.tsx`. snapshots/notifications 테이블 이미 모든 데이터 보유 → 쿼리만 추가. recharts 추천 (shadcn Charts 호환).

**Effort.** 사람 M (3~5일) → CC ~1.5시간

**Priority.** P3

**Depends on / blocks.** 없음.

---

## TODO 8 — Watcher Platform 활성화 (캠핑장 위젯 + 알림 인프라 일괄)

**What.** Phase 1 단순화 결정으로 deferred된 알림 인프라 전체를 활성화: Web Push (VAPID + Service Worker push handler) + Supabase pg_cron (or GitHub Actions) + `snapshots`/`notifications`/`push_subs`/`cron_runs` 4개 테이블 + 알림 dispatcher + 캠핑장 빈자리 위젯 추가.

**Why.** Phase 1 결정 시 사용자가 "조회만, 무료"를 명시 → 알림 인프라 deferred. 그러나 Watcher Platform 비전(차터 §1)의 코어 가치는 알림형 위젯에 있음. 캠핑장 줍줍은 알림 없이는 의미 0. Phase 2 전환 trigger condition 충족 시 즉시 활성화.

**Pros.**
- Watcher Platform 비전 완성. 캠핑장·리콜 등 알림 가치가 강한 use case 활성화.
- 위젯 인터페이스가 Phase 1에 `alerting?` reserved로 박혀 있어 evolution 비용 작음.
- 인프라 한 번 만들면 새 알림형 위젯 추가는 거의 무료.

**Cons.**
- Vercel Hobby cron 1/day 한도 → Supabase pg_cron 또는 GitHub Actions로 우회 필요 (둘 다 무료지만 학습 곡선).
- iOS Web Push는 iOS 16.4+ + PWA install 필수 — setup checklist 명시.
- Schema drift admin alert는 Web Push self-notify가 첫 폴링 chicken-egg 위험 (Outside Voice #2) → 시스템 시작 시 dummy push test로 구독 검증 필요.

**Context (`/plan-eng-review` Outside Voice 발견 사항):**
- Cron tier: Vercel Hobby = 1 cron/day로 deploy 시점 fail. **Supabase pg_cron 권장** (Free tier 포함, pg_net으로 Edge Function 호출 → 위젯 폴링).
- Cron 자체 모니터링 (cron_runs 테이블 + dashboard 진입 시 "최신 cron > 90분 전" 배너 — Outside Voice #3).
- pollIntervalSec 하한 zod refinement (Outside Voice #4).
- iOS Web Push는 setup checklist 첫 단계로 PWA install 안내 (Outside Voice #6).
- Step 분할: (8a) DB 마이그레이션 + cron skeleton, (8b) VAPID + SW + subscribe API, (8c) runner + baseline 보호 + dispatcher (Outside Voice #7).

**Effort.** 사람 L (1~2주) → CC ~6시간

**Priority.** P1 (Trigger condition 충족 즉시)

**Depends on / blocks.** Phase 1 위젯 3개 안정 운영 60일 후 또는 명시적 알림 use case 등장. TODO 5 (스마트홈 트리거)는 본 인프라 의존.

---

## TODO 9 — Phase 2 Trigger Condition 정기 점검

**What.** PLAN.md §12 Phase 2 trigger condition 4가지를 분기마다 점검 (사용량/명시적 결정/사용자 확장/데이터 확장). 한 가지라도 충족되면 TODO 8 진행 결정.

**Why.** SCOPE EXPANSION 모드 비판 (Outside Voice #8) — 사이드 프로젝트가 Phase 2 안 가면 Phase 1의 plugin abstraction이 over-engineered. Trigger 명시로 의식적 의사결정.

**Pros.** Phase 1 abstraction 비용을 의식적으로 정당화. 안 쓰는 추상화 누적 방지.

**Cons.** 분기 점검 자체가 가벼운 운영 부담.

**Context.** PLAN.md §12에 4가지 trigger condition 명시. 분기마다 본인이 dashboard 진입 빈도, 새 데이터 소스 등장, 외부 요청 등을 자가 점검. 충족 없으면 다음 분기까지 Phase 1 유지 — 부끄러워할 일 아님 (인프라 단순함이 가치).

**Effort.** 사람 XS (30분/분기) → CC N/A

**Priority.** P1 운영 일정

**Depends on / blocks.** Phase 1 출시 후 자동 시작.

---

## 변경 이력

| 날짜 | 변경 |
|------|------|
| 2026-05-04 | 최초 작성 — 7개 항목 (자연어 위젯, 다중 사용자, 갤러리, 체육시설, 스마트홈, 착한가격업소, health 페이지) — `/plan-ceo-review` SCOPE EXPANSION |
| 2026-05-04 | TODO 8 (Watcher Platform 인프라), TODO 9 (Phase 2 trigger 점검) 추가 — `/plan-eng-review` Phase 1 축소 결정 + Outside Voice 반영 |
