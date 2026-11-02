import { NextResponse, type NextRequest } from "next/server";

// robots.txt를 무시하는 크롤러 대비 — 알려진 봇 UA는 SSR 전에 403으로 끊는다.
// 응답 본문이 거의 없어 Fast Origin Transfer를 사실상 소모하지 않음.
const BOT_UA =
  /bot|crawl|spider|slurp|bytespider|gptbot|chatgpt-user|oai-searchbot|claudebot|claude-web|anthropic-ai|perplexity|ccbot|amazonbot|applebot|meta-externalagent|facebookexternalhit|diffbot|imagesift|petalbot|semrush|ahrefs|mj12|dotbot|dataforseo|yeti|daum|headlesschrome|python-requests|python-urllib|aiohttp|httpx|go-http-client|curl|wget|scrapy|node-fetch|axios/i;

export function proxy(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) {
    return new NextResponse(null, { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  // 정적 자산·robots.txt·manifest·아이콘은 통과 (CDN 캐시 대상)
  matcher: [
    "/((?!_next/static|_next/image|robots.txt|manifest.webmanifest|sw.js|favicon.ico|icon).*)",
  ],
};
