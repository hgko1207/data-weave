"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Dev mode: unregister any leftover SW + clear caches so stale chunks
      // from a previous `npm run start` don't break HMR.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
        console.warn("[sw] register failed:", err);
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
