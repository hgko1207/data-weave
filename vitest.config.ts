import { defineConfig } from "vitest/config";
import path from "node:path";

// Vitest 설정 — 위젯 schema / mock / normalize 단위 테스트.
// React 컴포넌트 테스트는 도입 안 함(현재 schema drift 감지 위주).
export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
