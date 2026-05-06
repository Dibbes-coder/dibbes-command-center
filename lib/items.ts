export const ITEM_TYPES = ["Signal", "Prompt", "Project", "Workflow", "Experiment", "Note"] as const;
export const ITEM_STATUSES = ["Raw", "Active", "Ready to Ship", "Shipped", "Archived"] as const;
export const ITEM_ENERGIES = ["Low", "Medium", "High", "Critical"] as const;

export type ItemType = (typeof ITEM_TYPES)[number];
export type ItemStatus = (typeof ITEM_STATUSES)[number];
export type ItemEnergy = (typeof ITEM_ENERGIES)[number];

export type CommandItem = {
  id: string;
  title: string;
  type: ItemType;
  status: ItemStatus;
  energy: ItemEnergy;
  tags: string[];
  content: string;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
};

export type ItemDraft = {
  title: string;
  type: ItemType;
  status: ItemStatus;
  energy: ItemEnergy;
  tags: string[];
  content: string;
  nextAction: string;
};

export const emptyDraft: ItemDraft = {
  title: "",
  type: "Signal",
  status: "Raw",
  energy: "Medium",
  tags: [],
  content: "",
  nextAction: "",
};

export function itemToDraft(item: CommandItem): ItemDraft {
  return {
    title: item.title,
    type: item.type,
    status: item.status,
    energy: item.energy,
    tags: item.tags,
    content: item.content,
    nextAction: item.nextAction,
  };
}

export function makeItem(draft: ItemDraft): CommandItem {
  const now = new Date().toISOString();

  return {
    ...draft,
    id: createId(),
    title: cleanTitle(draft.title),
    type: normalizeType(draft.type),
    status: normalizeStatus(draft.status),
    energy: normalizeEnergy(draft.energy),
    tags: cleanTags(draft.tags),
    createdAt: now,
    updatedAt: now,
  };
}

export function reviseItem(item: CommandItem, draft: ItemDraft): CommandItem {
  return {
    ...item,
    ...draft,
    title: cleanTitle(draft.title),
    type: normalizeType(draft.type),
    status: normalizeStatus(draft.status),
    energy: normalizeEnergy(draft.energy),
    tags: cleanTags(draft.tags),
    updatedAt: new Date().toISOString(),
  };
}

export function parseTags(value: string): string[] {
  return cleanTags(value.split(","));
}

export function cleanTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)));
}

export function readableDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function draftFromUnknown(value: unknown): ItemDraft {
  const record = isRecord(value) ? value : {};

  return {
    title: typeof record.title === "string" ? record.title : "",
    type: normalizeType(record.type),
    status: normalizeStatus(record.status),
    energy: normalizeEnergy(record.energy),
    tags: Array.isArray(record.tags) ? cleanTags(record.tags.map(String)) : parseTags(String(record.tags ?? "")),
    content: typeof record.content === "string" ? record.content : "",
    nextAction: typeof record.nextAction === "string" ? record.nextAction : "",
  };
}

export function normalizeType(value: unknown): ItemType {
  return ITEM_TYPES.includes(value as ItemType) ? (value as ItemType) : "Signal";
}

export function normalizeStatus(value: unknown): ItemStatus {
  return ITEM_STATUSES.includes(value as ItemStatus) ? (value as ItemStatus) : "Raw";
}

export function normalizeEnergy(value: unknown): ItemEnergy {
  return ITEM_ENERGIES.includes(value as ItemEnergy) ? (value as ItemEnergy) : "Medium";
}

function cleanTitle(title: string): string {
  return title.trim() || "Untitled signal";
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
