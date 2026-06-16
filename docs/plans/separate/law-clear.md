# LawClear — 조례·법안 AI 풀이 (별도 신규 프로젝트)

> ⚠️ **DataWeave 위젯 아님.** 별도 Next.js 프로젝트로 새로 시작. DataWeave의 시각화·대시보드 정체성과 결이 다른 "텍스트+AI" 제품이라 분리.

**한 줄 가치**: "복잡한 조례를 AI가 일반인 언어로 풀어준다."

**왜 분리**: DataWeave에 끼우면 정체성 흐려짐 (데이터 시각화 ↔ 텍스트 요약). 분리하면 두 개의 포트폴리오가 각자 강해짐. 둘 다 "공공데이터 + 시민 도구" 결이라 자연스러운 자매작.

---

## 제품 컨셉

- 사용자가 키워드 또는 카테고리로 조례·법안·자치법규 검색
- 검색 결과 클릭 → **Claude가 3문장 요약**: ① 누구에게 적용 ② 무엇을 의무·권리 ③ 시행일·예외
- "내 상황엔?" 자연어 질문 → 적용 여부 답변
- 즐겨찾기 + 개정 알림

**대상 사용자**: 자영업자(인허가·세금 조례), 임대인·임차인(주택 조례), 시민단체·언론, 일반 시민.

**경쟁작**: 국가법령정보센터(law.go.kr) — 검색만 잘 됨, 요약·해석 0. 법무법인 블로그 — 단편적.

---

## 기술 스택 (DataWeave에서 이식)

| 영역 | 선택 | 이식 |
|------|------|------|
| Frontend | Next.js 16 + App Router + Turbopack | DataWeave 그대로 |
| Styling | Tailwind v4 + 다크 톤 | DESIGN.md 정신 그대로 (다른 컬러 액센트 가능 — 예: indigo) |
| AI | **Claude Haiku 4.5** (기본) / Sonnet (옵션) | 새로 추가 |
| DB | Supabase (사용자·즐겨찾기·요약 캐시) | DataWeave 패턴 |
| 배포 | Vercel + icn1 region | DataWeave 그대로 |
| 검증 | Zod strict, vitest | DataWeave 그대로 |

**Claude API 핵심 패턴 (gstack의 `claude-api` 스킬 활용)**:
- **Prompt caching** — 요약 시스템 프롬프트는 cache_control로 5분 캐싱 → 비용 90% 절감
- **Streaming** — 요약 생성 중 실시간 텍스트 streaming (UX)
- **Structured output (tool use)** — 요약을 JSON 구조(`{summary, who, what, when, exceptions}`)로 받으면 UI 렌더 쉬움

---

## 데이터 소스

| 소스 | API | 비고 |
|------|-----|------|
| **국가법령정보센터 OpenAPI** | `open.law.go.kr` | 법령·자치법규·행정규칙. 인증키 발급 필요 |
| **자치법규정보시스템 (ELIS)** | `elis.go.kr` | 지방자치단체 자치법규 (지자체별) |
| 지방의회 자체 API | 시·도별 분산 | 일관성 ↓ (서울/경기 정도만 양호) |

**Phase 1**: 국가법령정보센터만 통합. ELIS·지방의회는 Phase 2+.

---

## 핵심 기능 (Phase 분할)

### Phase 1 — MVP (2주)
- 조례·법안 키워드 검색 (국가법령정보센터 API)
- 결과 리스트 (이름·종류·시행일·소관부처)
- 클릭 시 본문 + **AI 요약 3문장**
- 캐싱 없음 (호출마다 Claude)
- 디스크레이머: "AI 요약은 참고용. 정확한 적용은 원문/전문가 확인."

### Phase 2 — 캐싱 + UX (1주)
- Supabase에 (law_id, model_version) → summary 캐시
- 같은 조례 재호출 시 캐시 hit (비용 0)
- Streaming UX (요약 생성 중 텍스트 점차 보임)
- 즐겨찾기 (Supabase 사용자 계정)

### Phase 3 — 자연어 Q&A (2주)
- "이 조례가 카페 운영하는 나한테 어떻게 적용돼?" 같은 질문
- Claude Sonnet (더 깊은 추론, 비용 ↑)
- 응답 캐싱은 어려움 (질문이 자유) — rate limiting 필요

### Phase 4 — 알림·비교 (1주~)
- 즐겨찾기 조례 개정 시 이메일 또는 push
- 비슷한 조례 비교 (서울시 vs 경기도 같은 조례)
- 시민 의견 공간

---

## 핵심 컴포넌트 구조 (예상)

```
src/
├ app/
│  ├ layout.tsx                # 다크 톤 + 사이드바(검색·즐겨찾기)
│  ├ page.tsx                  # 홈 = 검색
│  ├ law/[id]/page.tsx         # 조례 상세 + AI 요약
│  └ api/summarize/route.ts    # Claude 호출 (서버 라우트)
├ components/
│  ├ SearchBar.tsx
│  ├ LawCard.tsx               # 검색 결과 카드
│  ├ LawDetail.tsx             # 원문 + 메타
│  ├ AISummary.tsx             # 요약 표시 + streaming
│  └ Disclaimer.tsx
├ lib/
│  ├ law-api.ts                # 국가법령정보센터 fetch
│  ├ claude.ts                 # Claude API wrapper + prompt 템플릿
│  └ supabase/                 # 캐시 + 사용자
└ types/
   └ law.ts                    # Zod 스키마
```

---

## AI 통합 — 프롬프트·비용 설계

### 시스템 프롬프트 (캐시 대상)

```
당신은 한국의 법령·조례를 일반인이 이해하기 쉽게 풀어주는 도우미입니다.

규칙:
1. 3문장으로 요약: ① 누구에게 적용 ② 무엇을 의무/권리 ③ 시행일·예외 핵심
2. 법률 용어 대신 일상 언어 사용
3. 정확하지 않으면 "원문 확인 권장"이라 명시
4. 결정·해석 절대 안 함 — 정보 정리만

응답 형식 (JSON):
{
  "summary": "3문장 요약",
  "who": "적용 대상",
  "what": "핵심 의무/권리",
  "when": "시행일·기간",
  "exceptions": "예외 조항 (있으면)",
  "needsExpert": boolean
}
```

이 시스템 프롬프트(~300 token)를 **cache_control: { type: "ephemeral" }** 로 마크 → 5분 TTL 캐싱.

### 비용 추정 (Claude Haiku 4.5)

- Haiku 4.5: 입력 $0.25/MTok, 출력 $1.25/MTok
- 평균 조례 본문 ~3,000 token (입력)
- 응답 ~500 token (JSON 출력)
- 시스템 프롬프트 캐시 hit 시 입력 비용 90% 절감

**건당**:
- 캐시 miss: $(3000 × 0.25 + 500 × 1.25) / 1M ≈ $0.001375 ≈ 2원
- 캐시 hit (5분 내 재호출): $0.0003 ≈ 0.4원

**월 비용 예상** (1,000명 × 평균 10건/월 = 10,000건):
- 70% 캐시 hit 가정: 10,000 × (0.3 × 2 + 0.7 × 0.4) ≈ 9,000원/월

→ 개인 프로젝트로 운영 충분히 가능. 광고·후원으로 메꿔지면 더 좋음.

### Rate Limiting

- 사용자당 시간당 20건 (Supabase row count)
- IP당 시간당 50건 (Vercel KV)
- 전체 일 5,000건 cap (비용 폭주 방지)

---

## 차별화 포인트

1. **3문장 강제 요약** — 다른 도구는 길게 풀어줌. 사용자는 핵심만 원함.
2. **분류·필터** — "내 카페 관련 조례만", "최근 6개월 신설" 같은 슬라이스.
3. **알림** — 관심 분야 신설·개정 시 알림.
4. **데스크 톤 디자인** — 변호사 사이트 같은 정중함, DataWeave의 클린 UX 톤.
5. **무료·오픈** — 공공데이터를 시민 도구로.

---

## 리스크·미해결

- **AI 요약 오류로 인한 법적 책임**: 디스크레이머 명시 + "전문가 확인 권장" 자동 표시 (특히 형사·민감 분야).
- **국가법령정보센터 API의 응답 일관성**: 조례마다 본문 구조가 천차만별. 파싱 어려움 — Zod로 strict, 실패 시 raw 본문 표시.
- **자치법규(지자체별)**: 데이터 quality 매우 분산. Phase 1엔 국가 법령만, 지방은 Phase 2+.
- **Claude 비용 폭주**: 캐시 + rate limit + 일일 cap 3중 안전망.
- **검색 UX**: 키워드 검색 결과가 너무 많을 때 ranking — Phase 1엔 단순 시간순, Phase 3에 임베딩 기반 의미 검색 가능.
- **법령 개정 추적**: cron으로 매일 신설·개정 check + Supabase 업데이트.

---

## 의존성·외부 서비스

- 국가법령정보센터 OpenAPI 인증키 (open.law.go.kr 가입)
- Anthropic API 키 (`ANTHROPIC_API_KEY`)
- Supabase 프로젝트 (DataWeave와 별도 또는 공유 — 별도 추천)
- Vercel KV (rate limit 카운터)
- (Phase 3+) 이메일 발송 (Resend / Vercel)

---

## 시작 체크리스트

새 repo로 시작 시:

- [ ] `gh repo create law-clear --public` (or private)
- [ ] Next.js 16 init: `npx create-next-app@latest`
- [ ] DataWeave에서 `tailwind.config`, `globals.css`, `DESIGN.md` 핵심 부분 복사
- [ ] DataWeave에서 `components/ui/`, `BaseWidget` 같은 재사용 부분 복사
- [ ] `claude-api` gstack 스킬로 Claude SDK + 프롬프트 캐싱 셋업
- [ ] Supabase 프로젝트 생성 + schema 마이그레이션
- [ ] `.env.example` 작성
- [ ] Phase 1 MVP 출하

---

## DataWeave와의 관계

이 프로젝트는 DataWeave와 **독립**이지만 다음 면에서 자매작:
- 둘 다 "한국 공공데이터를 시민 도구로"
- 둘 다 다크 톤 + 동일 디자인 시스템(DESIGN.md) 재활용
- 포트폴리오에서 "데이터 시각화" + "AI 텍스트 처리" 두 축 균형
- 추후 통합 SSO(Supabase 공유)로 같은 사용자가 양쪽 즐겨찾기 동기화 가능

**먼저 DataWeave의 안정화·복지 위젯 완료 후 시작 권장** — 양다리 걸치면 둘 다 침몰.
