"use client";

import { useCallback, useState } from "react";

type Coords = { lat: number; lng: number };

type State =
  | { status: "idle"; coords: null; error: null }
  | { status: "requesting"; coords: null; error: null }
  | { status: "success"; coords: Coords; error: null }
  | { status: "error"; coords: null; error: string };

export function useGeolocation() {
  const [state, setState] = useState<State>({ status: "idle", coords: null, error: null });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "error", coords: null, error: "이 브라우저는 위치를 지원하지 않습니다" });
      return;
    }
    setState({ status: "requesting", coords: null, error: null });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          status: "success",
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
        }),
      (err) => setState({ status: "error", coords: null, error: err.message || "위치 권한이 거부되었습니다" }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  return { ...state, request };
}
