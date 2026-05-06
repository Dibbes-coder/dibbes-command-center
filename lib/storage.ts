import type { CommandItem } from "./items";
import { normalizeItem } from "./items";
import { sampleItems } from "./sample-data";

const STORAGE_KEY = "dibbes-command-center.items.v2";
const LEGACY_STORAGE_KEYS = ["dibbes-command-center.items.v1", "dibbes-command-center-items"];

export function loadItems(): CommandItem[] {
  if (!hasLocalStorage()) {
    return cloneItems(sampleItems);
  }

  const existing = window.localStorage.getItem(STORAGE_KEY) ?? readLegacyItems();

  if (!existing) {
    const seeded = cloneItems(sampleItems);
    saveItems(seeded);
    return seeded;
  }

  try {
    const parsed = JSON.parse(existing) as unknown;
    if (!Array.isArray(parsed)) return cloneItems(sampleItems);

    const normalized = parsed.map(normalizeItem).filter((item): item is CommandItem => Boolean(item));
    const items = normalized.length > 0 ? normalized : cloneItems(sampleItems);
    saveItems(items);
    return items;
  } catch {
    return cloneItems(sampleItems);
  }
}

export function saveItems(items: CommandItem[]): void {
  if (!hasLocalStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function seedSampleItems(): CommandItem[] {
  const seeded = cloneItems(sampleItems);
  saveItems(seeded);
  return seeded;
}

export function deleteAllItems(): void {
  if (!hasLocalStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

export function downloadItems(items: CommandItem[]): void {
  if (typeof document === "undefined") return;

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

function readLegacyItems(): string | null {
  for (const key of LEGACY_STORAGE_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  return null;
}
