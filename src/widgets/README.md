# 5분 안에 새 위젯 만들기

## 구조

```
src/widgets/<id>/
├── index.ts       # Widget 객체 export (registry에 등록)
├── fetch.ts       # 데이터 조회 (server-side)
├── schema.ts      # zod schema (drift 감지)
├── Render.tsx     # 화면 렌더 (client)
├── ConfigForm.tsx # (선택) 사용자 설정 폼
└── mock.ts        # 5xx/timeout 폴백 mock 데이터
```

## 1. 타입 + schema

```ts
// schema.ts
import { z } from "zod";
export const responseSchema = z.object({
  /* strict 모드: 알 수 없는 키는 drift로 throw */
}).strict();
export type Data = z.infer<typeof responseSchema>;
```

## 2. fetch

```ts
// fetch.ts
import { fetchWidget } from "../_fetch-wrapper";
import { responseSchema, type Data } from "./schema";
import type { WidgetContext } from "../_types";

export async function fetchData(ctx: WidgetContext): Promise<Data> {
  return fetchWidget({
    url: "https://...",
    schema: responseSchema,
    abort: ctx.abort,
  });
}
```

## 3. Render

```tsx
// Render.tsx
"use client";
import type { Data } from "./schema";

export function Render({ data }: { data: Data }) {
  return <div>{/* ... */}</div>;
}
```

## 4. index.ts (등록)

```ts
import { CloudSun } from "lucide-react";
import { fetchData } from "./fetch";
import { Render } from "./Render";
import type { Widget } from "../_types";
import type { Data } from "./schema";

export const widget: Widget<Data> = {
  id: "<id>",
  title: "위젯 이름",
  icon: CloudSun,
  category: "view",
  fetch: fetchData,
  Render,
};
```

## 5. registry에 추가

`src/widgets/_registry.bootstrap.ts`에 한 줄 추가:

```ts
import { widget as myWidget } from "./<id>";
registerWidget(myWidget);
```

## 체크리스트

- [ ] zod `.strict()` 사용 (drift 자동 감지)
- [ ] `fetchWidget` 사용 (timeout/retry/abort 자동)
- [ ] Render는 `"use client"`
- [ ] mock.ts로 5xx 폴백 데이터 제공
- [ ] tests/widgets/&lt;id&gt;.test.ts에 schema drift 테스트 추가
