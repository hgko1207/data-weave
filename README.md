# DataWeave

한국 공공데이터 조회형 위젯 대시보드. 날씨, SOS 병원·약국, 식품 리콜을 한 화면에서.

> Phase 1 — 위젯 3개, 무료 호스팅, 알림 인프라 없음. Phase 2 비전과 자세한 설계는 [docs/PLAN.md](docs/PLAN.md), [docs/DESIGN.md](docs/DESIGN.md), [docs/TODOS.md](docs/TODOS.md) 참고.

## 로컬 개발

```bash
npm install
cp .env.example .env.local   # 키 채우기
npm run dev                  # http://localhost:3000
```

### 필요한 API 키

`.env.local`에 최소한:

```
DATA_GO_KR_KEY=         # data.go.kr 발급 키 (날씨 + SOS 위젯)
FOODSAFETY_API_KEY=     # foodsafetykorea.go.kr 별도 발급 (식품 리콜)
```

키 없어도 자동으로 mock 데이터로 폴백되어 위젯이 동작합니다. 키 발급 방법은 [.env.example](.env.example) 주석 참고.

#### data.go.kr 활용신청이 필요한 서비스

같은 키 하나로 다음 3개 서비스 모두 사용. 각각 `활용신청` 한 번씩:

- 기상청_단기예보 ((구)_동네예보) 조회서비스 — https://www.data.go.kr/data/15084084/openapi.do
- 한국환경공단_에어코리아_대기오염정보 — https://www.data.go.kr/data/15073861/openapi.do
- 국립중앙의료원_전국 응급의료기관 정보 조회 서비스 — https://www.data.go.kr/data/15000563/openapi.do
- 국립중앙의료원_전국 약국 정보 조회 서비스 — https://www.data.go.kr/data/15000578/openapi.do

#### foodsafetykorea.go.kr (별도 시스템)

- https://www.foodsafetykorea.go.kr 가입 후 OpenAPI 이용신청
- "식품의 회수 및 판매중지 정보" 서비스 체크 → 인증키 발급

## 빌드

```bash
npm run build   # production build (Turbopack)
```

## 배포 (Vercel)

1. https://vercel.com → "Add New Project" → 이 GitHub 저장소(`hgko1207/data-weave`) Import.
2. Framework: Next.js 자동 감지.
3. Environment Variables에 추가:
   - `DATA_GO_KR_KEY`
   - `FOODSAFETY_API_KEY`
4. Deploy → 첫 배포 후 자동 도메인 (`data-weave.vercel.app`) 발급.
5. 이후 `git push origin main`만 하면 자동 재배포.

> Supabase는 Phase 1에선 옵션. 위젯 인스턴스를 DB에 저장하려면 [supabase/migrations/0001_widgets.sql](supabase/migrations/0001_widgets.sql) 적용 후 `.env`에 Supabase 키 등록. 현재 데모 대시보드는 [src/app/(dashboard)/page.tsx](src/app/(dashboard)/page.tsx) 안에 인스턴스가 하드코딩되어 있어 DB 없이도 동작.

## PWA 설치

- 데스크톱(Chrome/Edge): 주소창 오른쪽 "설치" 아이콘
- iOS Safari: 공유 버튼 → "홈 화면에 추가"
- 방문 3회 이상 + 활성 위젯 1개 이상이면 자동 설치 배너 표시

## 새 위젯 추가

5분이면 됩니다. [src/widgets/README.md](src/widgets/README.md) 가이드 참고.
