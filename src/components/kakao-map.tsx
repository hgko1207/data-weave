"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

// 공용 카카오맵 컴포넌트 — 약국·관광·도서관 등 모든 지도 위젯이 공유.
// SDK는 한 번만 로드 (script 중복 방지). 키 없으면 안내 카드로 graceful fallback.

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  color?: "emerald" | "rose" | "cyan" | "amber" | "zinc";
  label?: string;
};

type Props = {
  markers: MapMarker[];
  /** 비어있으면 markers의 bounds로 자동 fit */
  center?: { lat: number; lng: number };
  /** 시작 zoom 레벨 (1=가장 zoom in, 14=가장 out). center 명시 시만 사용. */
  level?: number;
  origin?: { lat: number; lng: number; label?: string };
  height?: string;
  onMarkerClick?: (id: string) => void;
  className?: string;
};

const MARKER_BG: Record<NonNullable<MapMarker["color"]>, string> = {
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
  amber: "bg-amber-500",
  zinc: "bg-zinc-500",
};

export function KakaoMap({
  markers,
  center,
  level = 5,
  origin,
  height = "h-[280px] sm:h-[360px]",
  onMarkerClick,
  className = "",
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  const sdkReady = useKakaoSdk(apiKey);

  // 지도 생성 / 마커 갱신
  useEffect(() => {
    if (!sdkReady || !mapRef.current) return;
    const maps = (window as unknown as KakaoWindow).kakao?.maps;
    if (!maps) return;

    // 기존 지도가 있으면 destroy 후 재생성
    const containerEl = mapRef.current;
    containerEl.innerHTML = ""; // 깨끗하게

    const map = new maps.Map(containerEl, {
      center: new maps.LatLng(
        center?.lat ?? origin?.lat ?? markers[0]?.lat ?? 36.5,
        center?.lng ?? origin?.lng ?? markers[0]?.lng ?? 127.5,
      ),
      level,
    });
    mapInstanceRef.current = map;

    // 마커들
    const overlays: unknown[] = [];
    for (const m of markers) {
      const color = m.color ?? "emerald";
      const html = `<div class="relative -translate-x-1/2 -translate-y-full pointer-events-auto">
        <div class="${MARKER_BG[color]} h-3 w-3 rounded-full ring-2 ring-white shadow-lg cursor-pointer"></div>
      </div>`;
      const overlay = new maps.CustomOverlay({
        position: new maps.LatLng(m.lat, m.lng),
        content: html,
        yAnchor: 1,
      });
      overlay.setMap(map);
      overlays.push(overlay);

      if (onMarkerClick) {
        // CustomOverlay는 직접 click 이벤트가 없어서 DOM에 listener 직접 부착
        // setTimeout 0으로 next-tick에 element 잡음
        setTimeout(() => {
          const el = overlay.getContent?.() as HTMLElement | string | undefined;
          if (typeof el === "object" && el && "querySelector" in el) {
            const target = (el as HTMLElement).querySelector("div div");
            target?.addEventListener("click", () => onMarkerClick(m.id));
          }
        }, 0);
      }
    }

    // origin (사용자 위치) 표시
    if (origin) {
      const html = `<div class="-translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div class="relative h-4 w-4 rounded-full bg-cyan-400 ring-4 ring-cyan-400/40 shadow-lg motion-safe:animate-pulse"></div>
      </div>`;
      const overlay = new maps.CustomOverlay({
        position: new maps.LatLng(origin.lat, origin.lng),
        content: html,
        yAnchor: 0.5,
        xAnchor: 0.5,
        zIndex: 10,
      });
      overlay.setMap(map);
      overlays.push(overlay);
    }

    // center 명시 안 했고 마커 1개 이상이면 bounds 자동
    if (!center && markers.length > 0) {
      const bounds = new maps.LatLngBounds();
      markers.forEach((m) => bounds.extend(new maps.LatLng(m.lat, m.lng)));
      if (origin) bounds.extend(new maps.LatLng(origin.lat, origin.lng));
      map.setBounds(bounds, 40, 40, 40, 40);
    }

    return () => {
      overlays.forEach((o) => {
        const ov = o as { setMap: (m: unknown) => void };
        ov.setMap?.(null);
      });
    };
  }, [sdkReady, center, level, markers, origin, onMarkerClick]);

  if (!apiKey) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-6 text-center ${height} ${className}`}
      >
        <MapPin className="h-5 w-5 text-zinc-500" aria-hidden />
        <p className="text-sm text-zinc-300">지도 표시 안 됨</p>
        <p className="text-xs text-zinc-500">
          NEXT_PUBLIC_KAKAO_MAP_KEY 환경변수 등록 시 자동 표시
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900 ${height} ${className}`}
      aria-label="카카오 지도"
    />
  );
}

// ── 카카오 SDK 로더 ─────────────────────────────────────────
// 한 번만 로드 (script 중복 방지). 여러 컴포넌트가 동시에 호출해도 안전.

function useKakaoSdk(apiKey: string | undefined): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!apiKey || typeof window === "undefined") return;

    const win = window as unknown as KakaoWindow;

    // 이미 maps 객체까지 로드된 경우
    if (win.kakao?.maps?.Map) {
      setReady(true);
      return;
    }

    // 이미 script가 박혀있는 경우 — polling으로 확인
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-kakao-sdk]",
    );
    if (existing) {
      const interval = setInterval(() => {
        if (win.kakao?.maps?.Map) {
          clearInterval(interval);
          setReady(true);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    // 신규 로드
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;
    script.dataset.kakaoSdk = "true";
    script.onload = () => {
      win.kakao?.maps?.load(() => setReady(true));
    };
    document.head.appendChild(script);
  }, [apiKey]);

  return ready;
}

// ── 타입 ───────────────────────────────────────────────────
// window.kakao 전역 타입은 strict하지 않게 unknown으로 감쌈. 카카오 SDK 타입 패키지가 우리 의존성에 없어서 직접 정의.

type KakaoLatLng = unknown;
type KakaoMap = {
  setBounds: (bounds: unknown, t?: number, r?: number, b?: number, l?: number) => void;
};
type KakaoCustomOverlay = {
  setMap: (map: unknown) => void;
  getContent?: () => HTMLElement | string;
};
type KakaoWindow = {
  kakao?: {
    maps?: {
      load: (cb: () => void) => void;
      Map: new (
        container: HTMLElement,
        options: { center: KakaoLatLng; level: number },
      ) => KakaoMap;
      LatLng: new (lat: number, lng: number) => KakaoLatLng;
      LatLngBounds: new () => { extend: (latlng: KakaoLatLng) => void };
      CustomOverlay: new (options: {
        position: KakaoLatLng;
        content: string;
        yAnchor?: number;
        xAnchor?: number;
        zIndex?: number;
      }) => KakaoCustomOverlay;
    };
  };
};
