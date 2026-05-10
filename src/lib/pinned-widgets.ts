"use client";

const STORAGE_KEY = "dataweave.pinned";
export const DEFAULT_PINNED = ["weather", "pharmacy", "food-recall"];

export function readPinned(): string[] {
  if (typeof window === "undefined") return DEFAULT_PINNED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PINNED;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((x) => typeof x === "string")
      ? parsed
      : DEFAULT_PINNED;
  } catch {
    return DEFAULT_PINNED;
  }
}

export function writePinned(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
