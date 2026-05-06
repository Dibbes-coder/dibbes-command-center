import type { CommandItem } from "./items";
import { sampleItems } from "./sample-data";

const STORAGE_KEY = "dibbes-command-center:v1";

export function loadItems(): CommandItem[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleItems));
    return sampleItems;
  }

  try {
    const parsed = JSON.parse(raw) as CommandItem[];
    return Array.isArray(parsed) ? parsed : sampleItems;
  } catch {
    return sampleItems;
  }
}

export function saveItems(items: CommandItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

  // Future Notion sync hook:
  // Queue changed items here and sync them to a Notion database once auth/backend exists.
  // Suggested future shape: POST /api/notion-sync with item IDs changed since last sync.
}

export function exportItems(items: CommandItem[]) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), items }, null, 2);
}
