import type { MetadataRoute } from "next";

// 개인용 대시보드 — 검색 노출 불필요.
// 위젯 상세 페이지가 force-dynamic SSR + 무한 URL(로또 회차, 단지 링크 등)이라
// 크롤러가 긁으면 Vercel Hobby Fast Origin Transfer 한도를 순식간에 넘긴다
// (2026-10 실제 정지 사례). 모든 크롤러 차단.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
