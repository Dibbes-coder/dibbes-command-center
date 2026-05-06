"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ITEM_ENERGIES,
  ITEM_STATUSES,
  ITEM_TYPES,
  emptyDraft,
  itemToDraft,
  makeItem,
  parseTags,
  readableDate,
  reviseItem,
  type CommandItem,
  type ItemDraft,
  type ItemEnergy,
  type ItemStatus,
  type ItemType,
} from "@/lib/items";
import { downloadItems, loadItems, saveItems, seedSampleItems } from "@/lib/storage";

type ViewMode = "All" | "Ready to Ship" | "Raw Signals" | "Prompt Lab";
type SelectAll<T extends string> = "All" | T;
type StorageMode = "checking" | "database" | "local";

type Filters = {
  query: string;
  type: SelectAll<ItemType>;
  status: SelectAll<ItemStatus>;
  tag: string;
  view: ViewMode;
};

type ItemsResponse = {
  database: boolean;
  items?: CommandItem[];
  item?: CommandItem;
  error?: string;
};

const initialFilters: Filters = {
  query: "",
  type: "All",
  status: "All",
  tag: "All",
  view: "All",
};

export default function CommandCenter() {
  const [items, setItems] = useState<CommandItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft);
  const [tagText, setTagText] = useState("");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [storageMode, setStorageMode] = useState<StorageMode>("checking");
  const [notice, setNotice] = useState("Connecting to database...");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const localItems = loadItems();

    setItems(localItems);
    setActiveId(localItems[0]?.id ?? null);

    async function hydrateFromDatabase() {
      try {
        const response = await fetch("/api/items", { cache: "no-store" });
        const payload = (await response.json()) as ItemsResponse;

        if (!response.ok || !payload.items) {
          throw new Error(payload.error ?? "Database unavailable.");
        }

        if (cancelled) return;
        setItems(payload.items);
        setActiveId(payload.items[0]?.id ?? null);
        saveItems(payload.items);
        setStorageMode("database");
        setNotice("Database connected. Changes are persisted to Postgres.");
      } catch (error) {
        if (cancelled) return;
        setStorageMode("local");
        setNotice(`${error instanceof Error ? error.message : "Database unavailable."} Using localStorage fallback.`);
      }
    }

    void hydrateFromDatabase();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [activeId, items],
  );

  useEffect(() => {
    if (!activeItem) {
      setDraft(emptyDraft);
      setTagText("");
      return;
    }

    const nextDraft = itemToDraft(activeItem);
    setDraft(nextDraft);
    setTagText(nextDraft.tags.join(", "));
  }, [activeItem]);

  const tags = useMemo(
    () => Array.from(new Set(items.flatMap((item) => item.tags))).sort(),
    [items],
  );

  const counts = useMemo(
    () => ({
      total: items.length,
      ready: items.filter((item) => item.status === "Ready to Ship").length,
      raw: items.filter((item) => item.status === "Raw").length,
      prompts: items.filter((item) => item.type === "Prompt").length,
      byType: ITEM_TYPES.map((type) => ({ label: type, count: countItems(items, "type", type) })),
      byStatus: ITEM_STATUSES.map((status) => ({ label: status, count: countItems(items, "status", status) })),
    }),
    [items],
  );

  const visibleItems = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return items.filter((item) => {
      const searchText = [
        item.title,
        item.type,
        item.status,
        item.energy,
        item.tags.join(" "),
        item.content,
        item.nextAction,
      ]
        .join(" ")
        .toLowerCase();

      if (query && !searchText.includes(query)) return false;
      if (filters.type !== "All" && item.type !== filters.type) return false;
      if (filters.status !== "All" && item.status !== filters.status) return false;
      if (filters.tag !== "All" && !item.tags.includes(filters.tag)) return false;
      if (filters.view === "Ready to Ship" && item.status !== "Ready to Ship") return false;
      if (filters.view === "Raw Signals" && item.status !== "Raw") return false;
      if (filters.view === "Prompt Lab" && item.type !== "Prompt") return false;

      return true;
    });
  }, [filters, items]);

  function persistLocal(nextItems: CommandItem[]) {
    setItems(nextItems);
    saveItems(nextItems);
  }

  function updateDraft<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function createBlankItem() {
    const blank = {
      ...emptyDraft,
      title: "New signal",
      content: "Capture the signal before it decays.",
      nextAction: "Clarify the next action.",
    };

    if (storageMode === "database") {
      const created = await createDatabaseItem(blank, handleDatabaseFailure);
      if (created) {
        const nextItems = [created, ...items];
        persistLocal(nextItems);
        setActiveId(created.id);
        return;
      }
    }

    const item = makeItem(blank);
    persistLocal([item, ...items]);
    setActiveId(item.id);
  }

  async function saveDraft() {
    const nextDraft = { ...draft, tags: parseTags(tagText) };
    setIsSaving(true);

    try {
      if (!activeItem) {
        const created = storageMode === "database" ? await createDatabaseItem(nextDraft, handleDatabaseFailure) : null;
        const item = created ?? makeItem(nextDraft);
        persistLocal([item, ...items]);
        setActiveId(item.id);
        return;
      }

      const updated = storageMode === "database" ? await updateDatabaseItem(activeItem.id, nextDraft, handleDatabaseFailure) : null;
      const nextItem = updated ?? reviseItem(activeItem, nextDraft);
      persistLocal(items.map((item) => (item.id === activeItem.id ? nextItem : item)));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteActiveItem() {
    if (!activeItem) return;
    setIsSaving(true);

    try {
      if (storageMode === "database") {
        const deleted = await deleteDatabaseItem(activeItem.id, handleDatabaseFailure);
        if (!deleted) {
          setNotice("Database delete failed. Removed locally so the interface stays usable.");
        }
      }

      const nextItems = items.filter((item) => item.id !== activeItem.id);
      persistLocal(nextItems);
      setActiveId(nextItems[0]?.id ?? null);
    } finally {
      setIsSaving(false);
    }
  }

  async function restoreSamples() {
    if (storageMode === "database") {
      const seeded = await seedDatabaseItems(handleDatabaseFailure);

      if (seeded) {
        persistLocal(seeded);
        setActiveId(seeded[0]?.id ?? null);
        return;
      }
    }

    const seeded = seedSampleItems();
    setItems(seeded);
    setActiveId(seeded[0]?.id ?? null);
  }

  function handleDatabaseFailure(message: string) {
    setStorageMode("local");
    setNotice(`${message} Using localStorage fallback until the database is reachable again.`);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(245,158,11,0.20),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(14,165,233,0.14),transparent_25%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_35%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="surface rounded-[2rem] p-5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.55em] text-amber-300/80">
                Signal. Speed. Precision.
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                Dibbes Command Center
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                A database-backed personal AI dashboard for raw signals, prompt experiments,
                active workflows, and work that is ready to ship.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => void createBlankItem()} disabled={isSaving}>Create item</button>
              <button className="btn-secondary" onClick={() => downloadItems(items)}>Export JSON</button>
              <button className="btn-secondary" onClick={() => void restoreSamples()} disabled={isSaving}>Seed sample data</button>
            </div>
          </div>
          <div className="mt-6 rounded-3xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-zinc-400">
            <span className={storageMode === "database" ? "text-emerald-300" : "text-amber-300"}>
              {storageMode === "database" ? "Postgres database active" : storageMode === "checking" ? "Checking database" : "Local fallback active"}
            </span>
            <span className="px-2 text-zinc-600">/</span>
            {notice}
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total" value={counts.total} />
          <Metric label="Ready to Ship" value={counts.ready} />
          <Metric label="Raw Signals" value={counts.raw} />
          <Metric label="Prompt Lab" value={counts.prompts} />
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <CountPanel title="By type" rows={counts.byType} />
          <CountPanel title="By status" rows={counts.byStatus} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="surface rounded-[2rem] p-4">
            <div className="grid gap-3">
              <input
                className="field"
                placeholder="Search titles, tags, content..."
                value={filters.query}
                onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Type"
                  value={filters.type}
                  options={["All", ...ITEM_TYPES]}
                  onChange={(value) => setFilters({ ...filters, type: value as SelectAll<ItemType> })}
                />
                <Select
                  label="Status"
                  value={filters.status}
                  options={["All", ...ITEM_STATUSES]}
                  onChange={(value) => setFilters({ ...filters, status: value as SelectAll<ItemStatus> })}
                />
              </div>
              <Select
                label="Tag"
                value={filters.tag}
                options={["All", ...tags]}
                onChange={(value) => setFilters({ ...filters, tag: value })}
              />
              <div className="grid grid-cols-2 gap-2">
                {(["All", "Ready to Ship", "Raw Signals", "Prompt Lab"] as ViewMode[]).map((view) => (
                  <button
                    key={view}
                    className={`rounded-2xl border px-3 py-3 text-xs font-bold transition ${
                      filters.view === view
                        ? "border-amber-300/60 bg-amber-300/10 text-amber-100"
                        : "border-white/10 bg-black/25 text-zinc-500 hover:border-white/25 hover:text-white"
                    }`}
                    onClick={() => setFilters({ ...filters, view })}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  className={`w-full rounded-3xl border p-4 text-left transition hover:border-amber-300/50 ${
                    activeId === item.id ? "border-amber-300/70 bg-amber-300/10" : "border-white/10 bg-black/25"
                  }`}
                  onClick={() => setActiveId(item.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold text-white">{item.title}</h2>
                    <span className="chip shrink-0">{item.energy}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">{item.content}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="chip">{item.type}</span>
                    <span className="chip">{item.status}</span>
                    {item.tags.slice(0, 2).map((tag) => <span className="chip" key={tag}>#{tag}</span>)}
                  </div>
                </button>
              ))}
              {visibleItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 p-6 text-sm leading-6 text-zinc-500">
                  No matching items. Reset filters or create a new signal.
                </div>
              ) : null}
            </div>
          </aside>

          <section className="surface rounded-[2rem] p-5 sm:p-7">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="label">Editor</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {activeItem ? "Refine item" : "Create item"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary" disabled={isSaving} onClick={() => void saveDraft()}>{isSaving ? "Saving..." : "Save"}</button>
                <button className="btn-danger" disabled={!activeItem || isSaving} onClick={() => void deleteActiveItem()}>Delete</button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="label md:col-span-2">
                Title
                <input className="field mt-2" value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} />
              </label>
              <Select label="Type" value={draft.type} options={ITEM_TYPES} onChange={(value) => updateDraft("type", value as ItemType)} />
              <Select label="Status" value={draft.status} options={ITEM_STATUSES} onChange={(value) => updateDraft("status", value as ItemStatus)} />
              <Select label="Energy" value={draft.energy} options={ITEM_ENERGIES} onChange={(value) => updateDraft("energy", value as ItemEnergy)} />
              <label className="label">
                Tags
                <input className="field mt-2" placeholder="ai, launch, prompt" value={tagText} onChange={(event) => setTagText(event.target.value)} />
              </label>
              <label className="label md:col-span-2">
                Content
                <textarea className="field mt-2 min-h-36 resize-y" value={draft.content} onChange={(event) => updateDraft("content", event.target.value)} />
              </label>
              <label className="label md:col-span-2">
                Next action
                <textarea className="field mt-2 min-h-24 resize-y" value={draft.nextAction} onChange={(event) => updateDraft("nextAction", event.target.value)} />
              </label>
            </div>

            <div className="mt-6 grid gap-3 rounded-3xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-400 sm:grid-cols-2">
              <p>Created: {activeItem ? readableDate(activeItem.createdAt) : "On save"}</p>
              <p>Updated: {activeItem ? readableDate(activeItem.updatedAt) : "On save"}</p>
            </div>

            <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm leading-6 text-amber-100/80">
              {/* Future OpenAI API integration point: summarize content, generate tags, improve prompts, or suggest the next action from this draft. */}
              OpenAI integration point reserved for future classify, summarize, rewrite,
              prompt-expand, and next-action generation flows.
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

async function createDatabaseItem(
  draft: ItemDraft,
  onFailure: (message: string) => void,
): Promise<CommandItem | null> {
  return mutateDatabase("/api/items", { method: "POST", body: JSON.stringify(draft) }, onFailure);
}

async function updateDatabaseItem(
  id: string,
  draft: ItemDraft,
  onFailure: (message: string) => void,
): Promise<CommandItem | null> {
  return mutateDatabase(
    `/api/items/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify(draft) },
    onFailure,
  );
}

async function deleteDatabaseItem(id: string, onFailure: (message: string) => void): Promise<boolean> {
  try {
    const response = await fetch(`/api/items/${encodeURIComponent(id)}`, { method: "DELETE" });

    if (!response.ok) {
      const payload = (await response.json()) as ItemsResponse;
      throw new Error(payload.error ?? "Database delete failed.");
    }

    return true;
  } catch (error) {
    onFailure(error instanceof Error ? error.message : "Database delete failed.");
    return false;
  }
}

async function seedDatabaseItems(onFailure: (message: string) => void): Promise<CommandItem[] | null> {
  try {
    const response = await fetch("/api/items/seed", { method: "POST" });
    const payload = (await response.json()) as ItemsResponse;

    if (!response.ok || !payload.items) {
      throw new Error(payload.error ?? "Database seed failed.");
    }

    return payload.items;
  } catch (error) {
    onFailure(error instanceof Error ? error.message : "Database seed failed.");
    return null;
  }
}

async function mutateDatabase(
  url: string,
  init: RequestInit,
  onFailure: (message: string) => void,
): Promise<CommandItem | null> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
    const payload = (await response.json()) as ItemsResponse;

    if (!response.ok || !payload.item) {
      throw new Error(payload.error ?? "Database write failed.");
    }

    return payload.item;
  } catch (error) {
    onFailure(error instanceof Error ? error.message : "Database write failed.");
    return null;
  }
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface rounded-3xl p-5">
      <p className="label">{label}</p>
      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
    </div>
  );
}

function CountPanel({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <div className="surface rounded-3xl p-5">
      <h2 className="label">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-sm text-zinc-400">
              <span>{row.label}</span>
              <span>{row.count}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-amber-300" style={{ width: `${(row.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="label">
      {label}
      <select className="field mt-2" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function countItems<T extends "type" | "status">(
  items: CommandItem[],
  key: T,
  value: CommandItem[T],
): number {
  return items.filter((item) => item[key] === value).length;
}
