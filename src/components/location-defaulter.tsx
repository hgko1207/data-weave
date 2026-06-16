"use client";

import { useEffect } from "react";
import {
  nearestSido,
  USER_SIDO_COOKIE,
  USER_SIDO_STORAGE,
} from "@/lib/user-location";

// 첫 진입 시 사용자 위치를 받아 가장 가까운 시·도를 cookie/localStorage에 저장.
// 위젯 페이지(SSR)가 cookie를 읽어 기본 region으로 사용 → 매번 "대전" 대신 본인 위치.
// - 권한 거부 / 미지원 시 silent fail (cookie 미설정, default 유지)
// - 한 번 설정되면 재요청 안 함 (localStorage가 있는 동안)
// - 이미 본 페이지는 reload하지 않음 — 다음 페이지부터 적용 (UX 부드러움)
export function LocationDefaulter() {
  useEffect(() => {
    // 이미 위치 알고 있으면 skip
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(USER_SIDO_STORAGE);
    if (stored) {
      // localStorage 있으면 cookie도 동기화 (다른 탭 / 만료 대비)
      setSidoCookie(stored);
      return;
    }
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const sido = nearestSido(pos.coords.latitude, pos.coords.longitude);
        window.localStorage.setItem(USER_SIDO_STORAGE, sido);
        setSidoCookie(sido);
      },
      () => {
        // 권한 거부 / 타임아웃 — 조용히 무시. 다음에 사용자가 명시적으로 요청하면 다시 시도 가능.
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 24 * 60 * 60 * 1000 },
    );
  }, []);

  return null;
}

function setSidoCookie(sido: string): void {
  // 1년 유지, 모든 경로, SameSite=Lax (일반 navigation에서 전송됨)
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${USER_SIDO_COOKIE}=${encodeURIComponent(sido)}; path=/; max-age=${oneYear}; SameSite=Lax`;
}
