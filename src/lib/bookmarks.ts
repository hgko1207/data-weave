"use client";

const STORAGE_KEY = "dataweave.bookmarks";
const CHANGE_EVENT = "dataweave-bookmarks-changed";

export type Bookmark = {
  id: string;
  label: string;
  href: string;
  widgetId: string;
  createdAt: number;
};

export function readBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is Bookmark =>
        typeof b === "object" &&
        b !== null &&
        typeof (b as Bookmark).id === "string" &&
        typeof (b as Bookmark).href === "string" &&
        typeof (b as Bookmark).label === "string" &&
        typeof (b as Bookmark).widgetId === "string",
    );
  } catch {
    return [];
  }
}

function writeBookmarks(list: Bookmark[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function isBookmarked(href: string): boolean {
  return readBookmarks().some((b) => b.href === href);
}

export function addBookmark(b: Omit<Bookmark, "id" | "createdAt">): void {
  const list = readBookmarks();
  if (list.some((existing) => existing.href === b.href)) return;
  list.push({
    ...b,
    id: `${b.widgetId}-${Date.now()}`,
    createdAt: Date.now(),
  });
  writeBookmarks(list);
}

export function removeBookmark(href: string): void {
  const list = readBookmarks().filter((b) => b.href !== href);
  writeBookmarks(list);
}

export function toggleBookmark(
  b: Omit<Bookmark, "id" | "createdAt">,
): { active: boolean } {
  if (isBookmarked(b.href)) {
    removeBookmark(b.href);
    return { active: false };
  }
  addBookmark(b);
  return { active: true };
}

export function subscribeBookmarks(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
