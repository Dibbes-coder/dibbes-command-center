export const ITEM_TYPES = [
  "Idea",
  "X Post",
  "Image Prompt",
  "Project",
  "Experiment",
  "AI Workflow"
] as const;

export const STATUSES = [
  "Raw Signal",
  "Draft",
  "Shaping",
  "Ready to Ship",
  "Shipped",
  "Archived"
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];
export type Status = (typeof STATUSES)[number];

export type CommandItem = {
  id: string;
  title: string;
  type: ItemType;
  status: Status;
  energy: number;
  tags: string[];
  content: string;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
};

export type ItemDraft = Omit<CommandItem, "id" | "createdAt" | "updatedAt">;

export const emptyDraft: ItemDraft = {
  title: "",
  type: "Idea",
  status: "Raw Signal",
  energy: 3,
  tags: [],
  content: "",
  nextAction: ""
};

export function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag, index, tags) => tags.indexOf(tag) === index);
}

export function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function createItem(draft: ItemDraft): CommandItem {
  const now = new Date().toISOString();

  return {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now
  };
}

export function updateItem(item: CommandItem, draft: ItemDraft): CommandItem {
  return {
    ...item,
    ...draft,
    updatedAt: new Date().toISOString()
  };
}
