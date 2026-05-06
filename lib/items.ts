export const ITEM_TYPES = [
  "Raw Signal",
  "X Post",
  "Image Prompt",
  "Prompt",
  "AI Workflow",
  "Project",
  "Experiment",
  "Idea",
] as const;

export const ITEM_STATUSES = [
  "Raw",
  "Refining",
  "Ready to Ship",
  "Executed",
  "Archived",
] as const;

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
  executionNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type ItemDraft = Omit<CommandItem, "id" | "createdAt" | "updatedAt">;

export const emptyDraft: ItemDraft = {
  title: "",
  type: "Raw Signal",
  status: "Raw",
  energy: "Medium",
  tags: [],
  content: "",
  nextAction: "",
  executionNotes: "",
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
    executionNotes: item.executionNotes,
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

export function markItemExecuted(item: CommandItem, executionNotes: string): CommandItem {
  return {
    ...item,
    status: "Executed",
    executionNotes,
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

export function normalizeItem(value: unknown): CommandItem | null {
  if (!isRecord(value)) return null;

  const createdAt = typeof value.createdAt === "string" ? value.createdAt : new Date().toISOString();
  const updatedAt = typeof value.updatedAt === "string" ? value.updatedAt : createdAt;

  return {
    id: typeof value.id === "string" && value.id ? value.id : createId(),
    title: cleanTitle(typeof value.title === "string" ? value.title : "Untitled signal"),
    type: normalizeType(value.type),
    status: normalizeStatus(value.status),
    energy: normalizeEnergy(value.energy),
    tags: Array.isArray(value.tags) ? cleanTags(value.tags.map(String)) : [],
    content: typeof value.content === "string" ? value.content : "",
    nextAction: typeof value.nextAction === "string" ? value.nextAction : "",
    executionNotes: typeof value.executionNotes === "string" ? value.executionNotes : "",
    createdAt,
    updatedAt,
  };
}

export function normalizeType(value: unknown): ItemType {
  if (ITEM_TYPES.includes(value as ItemType)) return value as ItemType;
  if (value === "Signal") return "Raw Signal";
  if (value === "Workflow") return "AI Workflow";
  if (value === "Note") return "Idea";
  return "Raw Signal";
}

export function normalizeStatus(value: unknown): ItemStatus {
  if (ITEM_STATUSES.includes(value as ItemStatus)) return value as ItemStatus;
  if (value === "Active") return "Refining";
  if (value === "Shipped") return "Executed";
  return "Raw";
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
