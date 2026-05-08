import { getSignalDefinition, type SignalType } from "./signals";

export type HistoryItem = {
  id: string;
  signalType: SignalType;
  signalLabel: string;
  input: string;
  output: string;
  customInstruction?: string;
  savedAt: string;
};

const HISTORY_KEY = "dibbes-command-center.history.v1";

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isHistoryItem) : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

export function createHistoryItem({
  signalType,
  input,
  output,
  customInstruction,
}: {
  signalType: SignalType;
  input: string;
  output: string;
  customInstruction?: string;
}): HistoryItem {
  return {
    id: createId(),
    signalType,
    signalLabel: getSignalDefinition(signalType).label,
    input,
    output,
    customInstruction,
    savedAt: new Date().toISOString(),
  };
}

export function formatHistoryTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function isHistoryItem(value: unknown): value is HistoryItem {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const item = value as Partial<HistoryItem>;
  return Boolean(item.id && item.signalType && item.signalLabel && typeof item.output === "string" && item.savedAt);
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `history-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
