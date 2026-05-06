import type { CommandItem } from "./items";
import { sampleItems } from "./sample-data";

const STORAGE_KEY = "dibbes-command-center.items.v1";

export function loadItems(): CommandItem[] {
  if (!hasLocalStorage()) {
    return cloneItems(sampleItems);
  }

  const existing = window.localStorage.getItem(STORAGE_KEY);

  if (!existing) {
    const seeded = cloneItems(sampleItems);
    saveItems(seeded);
    return seeded;
  }

  try {
    const parsed = JSON.parse(existing) as CommandItem[];
    return Array.isArray(parsed) ? parsed : cloneItems(sampleItems);
  } catch {
    return cloneItems(sampleItems);
  }
}

export function saveItems(items: CommandItem[]): void {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function seedSampleItems(): CommandItem[] {
  const seeded = cloneItems(sampleItems);
  saveItems(seeded);
  return seeded;
}

export function downloadItems(items: CommandItem[]): void {
  if (typeof document === "undefined") {
    return;
  }

  const exportPayload = JSON.stringify(
    {
      source: "Dibbes Command Center",
      exportedAt: new Date().toISOString(),
      items,
    },
    null,
    2,
  );
  const blob = new Blob([exportPayload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `dibbes-command-center-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function cloneItems(items: CommandItem[]): CommandItem[] {
  return items.map((item) => ({ ...item, tags: [...item.tags] }));
}

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

// Future Notion sync integration point:
// Keep localStorage as the instant offline cache, then mirror item mutations to Notion
// from a dedicated integration layer when backend capabilities are intentionally added.
