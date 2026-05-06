"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import {
  CommandItem,
  ITEM_TYPES,
  ItemDraft,
  ItemType,
  STATUSES,
  Status,
  createItem,
  emptyDraft,
  formatDate,
  parseTags,
  updateItem
} from "@/lib/items";
import { exportItems, loadItems, saveItems } from "@/lib/storage";

type ViewMode = "Dashboard" | "Ready to Ship" | "Raw Signals" | "Prompt Lab";

type FilterState = {
  query: string;
  type: "All" | ItemType;
  status: "All" | Status;
  tag: "All" | string;
};

const views: ViewMode[] = ["Dashboard", "Ready to Ship", "Raw Signals", "Prompt Lab"];

const statusAccent: Record<Status, string> = {
  "Raw Signal": "border-sky-400/20 bg-sky-400/10 text-sky-200",
  Draft: "border-slate-400/20 bg-slate-400/10 text-slate-200",
  Shaping: "border-violet-400/20 bg-violet-400/10 text-violet-200",
  "Ready to Ship": "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Shipped: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  Archived: "border-zinc-400/20 bg-zinc-400/10 text-zinc-300"
};

const typeAccent: Record<ItemType, string> = {
  Idea: "Idea",
  "X Post": "X",
  "Image Prompt": "IMG",
  Project: "PRJ",
  Experiment: "EXP",
  "AI Workflow": "AI"
};

const defaultFilters: FilterState = {
  query: "",
  type: "All",
  status: "All",
  tag: "All"
};

function sortByUpdatedDesc(items: CommandItem[]) {
  return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function applyFilters(items: CommandItem[], filters: FilterState) {
  const query = filters.query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesQuery = !query
      ? true
      : [item.title, item.type, item.status, item.content, item.nextAction, item.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(query);

    const matchesType = filters.type === "All" || item.type === filters.type;
    const matchesStatus = filters.status === "All" || item.status === filters.status;
    const matchesTag = filters.tag === "All" || item.tags.includes(filters.tag);

    return matchesQuery && matchesType && matchesStatus && matchesTag;
  });
}

export function CommandCenter() {
  const [items, setItems] = useState<CommandItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>("Dashboard");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft);
  const [tagText, setTagText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadItems());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveItems(items);
  }, [items, loaded]);

  const allTags = useMemo(
    () => [...new Set(items.flatMap((item) => item.tags))].sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const scopedItems = useMemo(() => {
    const sorted = sortByUpdatedDesc(items);

    if (activeView === "Ready to Ship") {
      return sorted.filter((item) => item.status === "Ready to Ship");
    }

    if (activeView === "Raw Signals") {
      return sorted.filter((item) => item.status === "Raw Signal");
    }

    if (activeView === "Prompt Lab") {
      return sorted.filter((item) => item.type === "Image Prompt" || item.type === "AI Workflow");
    }

    return sorted;
  }, [activeView, items]);

  const visibleItems = useMemo(() => applyFilters(scopedItems, filters), [scopedItems, filters]);

  const countsByType = useMemo(
    () => ITEM_TYPES.map((type) => ({ label: type, value: items.filter((item) => item.type === type).length })),
    [items]
  );

  const countsByStatus = useMemo(
    () => STATUSES.map((status) => ({ label: status, value: items.filter((item) => item.status === status).length })),
    [items]
  );

  const energyAverage = useMemo(() => {
    if (!items.length) return 0;
    return Math.round((items.reduce((sum, item) => sum + item.energy, 0) / items.length) * 10) / 10;
  }, [items]);

  function openCreateComposer(preset?: Partial<ItemDraft>) {
    const nextDraft = { ...emptyDraft, ...preset };
    setDraft(nextDraft);
    setTagText(nextDraft.tags.join(", "));
    setEditingId(null);
    setComposerOpen(true);
  }

  function openEditComposer(item: CommandItem) {
    setDraft({
      title: item.title,
      type: item.type,
      status: item.status,
      energy: item.energy,
      tags: item.tags,
      content: item.content,
      nextAction: item.nextAction
    });
    setTagText(item.tags.join(", "));
    setEditingId(item.id);
    setComposerOpen(true);
  }

  function closeComposer() {
    setComposerOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
    setTagText("");
  }

  function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanDraft: ItemDraft = {
      ...draft,
      title: draft.title.trim() || "Untitled signal",
      tags: parseTags(tagText),
      content: draft.content.trim(),
      nextAction: draft.nextAction.trim(),
      energy: Number(draft.energy)
    };

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? updateItem(item, cleanDraft) : item)));
    } else {
      setItems((current) => [createItem(cleanDraft), ...current]);
    }

    closeComposer();
  }

  function deleteItem(id: string) {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) return;

    const confirmed = window.confirm(`Delete “${item.title}”?`);
    if (!confirmed) return;

    setItems((current) => current.filter((candidate) => candidate.id !== id));
  }

  function updateStatus(id: string, status: Status) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );
  }

  async function copyContent(item: CommandItem) {
    const payload = `${item.title}\n\n${item.content}\n\nNext action: ${item.nextAction || "—"}`.trim();

    try {
      await navigator.clipboard.writeText(payload);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
      setCopiedId(null);
    }
  }

  function downloadExport() {
    const blob = new Blob([exportItems(items)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dibbes-command-center-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setFilters(defaultFilters);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-command-radial text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:72px_72px]" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <Header onCreate={() => openCreateComposer()} onExport={downloadExport} />

        <div className="mt-6 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-innerGlow backdrop-blur-xl">
            <ViewNavigation activeView={activeView} setActiveView={setActiveView} />
            <Filters filters={filters} setFilters={setFilters} tags={allTags} resetFilters={resetFilters} />
            <div className="mt-5 rounded-3xl border border-amber-300/15 bg-amber-300/[0.055] p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-200/70">Operating code</p>
              <p className="mt-3 text-lg font-semibold tracking-tight text-amber-100">Signal. Speed. Precision.</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Capture weak signals fast. Shape what has voltage. Ship before the spark cools.
              </p>
            </div>
          </aside>

          <div className="min-w-0 space-y-4">
            {activeView === "Dashboard" && (
              <Dashboard
                total={items.length}
                energyAverage={energyAverage}
                countsByType={countsByType}
                countsByStatus={countsByStatus}
                items={items}
                onCreate={openCreateComposer}
              />
            )}

            <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-4 shadow-glow backdrop-blur-xl sm:p-5">
              <ListHeader activeView={activeView} count={visibleItems.length} onCreate={openCreateComposer} />

              {!loaded ? (
                <EmptyState title="Warming up the command center" description="Loading local signals from your browser." />
              ) : visibleItems.length ? (
                <div className="mt-4 grid gap-3 xl:grid-cols-2">
                  {visibleItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      copied={copiedId === item.id}
                      onCopy={() => copyContent(item)}
                      onEdit={() => openEditComposer(item)}
                      onDelete={() => deleteItem(item.id)}
                      onStatusChange={(status) => updateStatus(item.id, status)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No signals in this view"
                  description="Clear filters or capture something raw. Empty space is useful until it becomes avoidance."
                  actionLabel="Capture Signal"
                  onAction={() => openCreateComposer()}
                />
              )}
            </section>
          </div>
        </div>
      </section>

      {isComposerOpen && (
        <ComposerModal
          draft={draft}
          setDraft={setDraft}
          tagText={tagText}
          setTagText={setTagText}
          editing={Boolean(editingId)}
          onClose={closeComposer}
          onSubmit={submitDraft}
        />
      )}
    </main>
  );
}

function Header({ onCreate, onExport }: { onCreate: () => void; onExport: () => void }) {
  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-innerGlow backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-100">
            Dibbes Command Center
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Local-first MVP
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
          Creative control room.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Ideas, X posts, image prompts, projects, experiments and AI workflows — organized by signal, readiness and momentum.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:min-w-48">
        <Button onClick={onCreate}>Capture Signal</Button>
        <Button variant="ghost" onClick={onExport}>
          Export JSON
        </Button>
      </div>
    </header>
  );
}

function ViewNavigation({ activeView, setActiveView }: { activeView: ViewMode; setActiveView: (view: ViewMode) => void }) {
  return (
    <nav aria-label="Command center views" className="space-y-2">
      {views.map((view) => {
        const active = view === activeView;
        return (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
              active
                ? "border-amber-300/30 bg-amber-300/10 text-amber-50 shadow-glow"
                : "border-white/10 bg-white/[0.025] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              {view}
              <span className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-500">view</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function Filters({
  filters,
  setFilters,
  tags,
  resetFilters
}: {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  tags: string[];
  resetFilters: () => void;
}) {
  return (
    <section className="mt-5 space-y-3 border-t border-white/10 pt-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-slate-500">Filters</p>
        <button onClick={resetFilters} className="text-xs font-medium text-slate-400 transition hover:text-amber-100">
          Clear
        </button>
      </div>

      <label className="block">
        <span className="sr-only">Search</span>
        <input
          value={filters.query}
          onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
          placeholder="Search signals..."
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-amber-300/40"
        />
      </label>

      <FilterSelect
        label="Type"
        value={filters.type}
        onChange={(value) => setFilters((current) => ({ ...current, type: value as FilterState["type"] }))}
        options={["All", ...ITEM_TYPES]}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        onChange={(value) => setFilters((current) => ({ ...current, status: value as FilterState["status"] }))}
        options={["All", ...STATUSES]}
      />
      <FilterSelect
        label="Tag"
        value={filters.tag}
        onChange={(value) => setFilters((current) => ({ ...current, tag: value }))}
        options={["All", ...tags]}
      />
    </section>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-amber-300/40"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Dashboard({
  total,
  energyAverage,
  countsByType,
  countsByStatus,
  items,
  onCreate
}: {
  total: number;
  energyAverage: number;
  countsByType: { label: string; value: number }[];
  countsByStatus: { label: string; value: number }[];
  items: CommandItem[];
  onCreate: (preset?: Partial<ItemDraft>) => void;
}) {
  const ready = items.filter((item) => item.status === "Ready to Ship").length;
  const raw = items.filter((item) => item.status === "Raw Signal").length;
  const promptLab = items.filter((item) => item.type === "Image Prompt" || item.type === "AI Workflow").length;

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total signals" value={String(total)} note="Stored in this browser" />
        <MetricCard label="Ready to ship" value={String(ready)} note="Move before the window closes" tone="gold" />
        <MetricCard label="Raw signals" value={String(raw)} note="Uncut creative voltage" />
        <MetricCard label="Avg. energy" value={energyAverage ? `${energyAverage}/5` : "—"} note={`${promptLab} in Prompt Lab`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CountPanel title="By type" counts={countsByType} />
        <CountPanel title="By status" counts={countsByStatus} />
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-4 shadow-innerGlow backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-200/70">Fast capture</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Choose the lane. Drop the signal.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <QuickCapture label="X Post" onClick={() => onCreate({ type: "X Post", status: "Draft", energy: 4 })} />
            <QuickCapture label="Image Prompt" onClick={() => onCreate({ type: "Image Prompt", status: "Shaping", energy: 4 })} />
            <QuickCapture label="AI Workflow" onClick={() => onCreate({ type: "AI Workflow", status: "Raw Signal", energy: 4 })} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, note, tone = "default" }: { label: string; value: string; note: string; tone?: "default" | "gold" }) {
  return (
    <div
      className={`rounded-[2rem] border p-5 shadow-innerGlow ${
        tone === "gold" ? "border-amber-300/20 bg-amber-300/[0.07]" : "border-white/10 bg-white/[0.035]"
      }`}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{note}</p>
    </div>
  );
}

function CountPanel({ title, counts }: { title: string; counts: { label: string; value: number }[] }) {
  const max = Math.max(1, ...counts.map((count) => count.value));

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-innerGlow">
      <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">{title}</h2>
      <div className="mt-4 space-y-3">
        {counts.map((count) => (
          <div key={count.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-300">{count.label}</span>
              <span className="text-slate-500">{count.value}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div className="h-2 rounded-full bg-gradient-to-r from-amber-200 to-sky-200" style={{ width: `${(count.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickCapture({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-amber-300/30 hover:bg-amber-300/10 hover:text-amber-100"
    >
      + {label}
    </button>
  );
}

function ListHeader({ activeView, count, onCreate }: { activeView: ViewMode; count: number; onCreate: () => void }) {
  const description: Record<ViewMode, string> = {
    Dashboard: "All captured items, filtered by your current search and lens.",
    "Ready to Ship": "Finished enough. Sharp enough. Waiting for the move.",
    "Raw Signals": "Fresh sparks before they become language, assets or systems.",
    "Prompt Lab": "Image prompts and AI workflows. The forge."
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-slate-500">{count} visible</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{activeView}</h2>
        <p className="mt-1 text-sm text-slate-400">{description[activeView]}</p>
      </div>
      <Button variant="ghost" onClick={onCreate}>
        New Item
      </Button>
    </div>
  );
}

function ItemCard({
  item,
  copied,
  onCopy,
  onEdit,
  onDelete,
  onStatusChange
}: {
  item: CommandItem;
  copied: boolean;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Status) => void;
}) {
  return (
    <article className="group flex min-h-80 flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 shadow-innerGlow transition hover:border-amber-300/20 hover:bg-white/[0.055]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.18em] text-slate-300">
              {typeAccent[item.type]}
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold ${statusAccent[item.status]}`}>{item.status}</span>
          </div>
          <h3 className="mt-4 line-clamp-2 text-xl font-semibold tracking-tight text-white">{item.title}</h3>
        </div>
        <Energy value={item.energy} />
      </div>

      <p className="command-scrollbar mt-4 max-h-32 overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-300">{item.content || "No content yet."}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.length ? (
          item.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-slate-950/50 px-2.5 py-1 text-xs text-slate-400">
              #{tag}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-600">No tags</span>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-slate-500">Next action</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{item.nextAction || "Define the next move."}</p>
      </div>

      <div className="mt-auto pt-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>Created {formatDate(item.createdAt)}</span>
          <span>Updated {formatDate(item.updatedAt)}</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            aria-label={`Change status for ${item.title}`}
            value={item.status}
            onChange={(event) => onStatusChange(event.target.value as Status)}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs outline-none transition focus:border-amber-300/40"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <SmallAction onClick={onCopy}>{copied ? "Copied" : "Copy"}</SmallAction>
            <SmallAction onClick={onEdit}>Edit</SmallAction>
            <SmallAction danger onClick={onDelete}>
              Delete
            </SmallAction>
          </div>
        </div>
      </div>
    </article>
  );
}

function Energy({ value }: { value: number }) {
  return (
    <div className="flex items-end gap-1" aria-label={`Energy ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((level) => (
        <span
          key={level}
          className={`w-1.5 rounded-full ${level <= value ? "bg-amber-200" : "bg-white/10"}`}
          style={{ height: `${level * 5 + 8}px` }}
        />
      ))}
    </div>
  );
}

function SmallAction({ children, onClick, danger = false }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-2xl border px-3 py-2 text-xs font-medium transition ${
        danger
          ? "border-rose-400/15 bg-rose-400/5 text-rose-200 hover:border-rose-300/30 hover:bg-rose-400/10"
          : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-amber-300/30 hover:bg-amber-300/10 hover:text-amber-100"
      }`}
    >
      {children}
    </button>
  );
}

function ComposerModal({
  draft,
  setDraft,
  tagText,
  setTagText,
  editing,
  onClose,
  onSubmit
}: {
  draft: ItemDraft;
  setDraft: Dispatch<SetStateAction<ItemDraft>>;
  tagText: string;
  setTagText: (value: string) => void;
  editing: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-3 backdrop-blur-md sm:items-center sm:p-6">
      <form
        onSubmit={onSubmit}
        className="command-scrollbar max-h-[92vh] w-full max-w-3xl overflow-auto rounded-[2rem] border border-white/10 bg-[#05070d] p-4 shadow-2xl shadow-black/60 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-200/70">{editing ? "Edit signal" : "New signal"}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{editing ? "Refine the asset." : "Capture before it fades."}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-400 transition hover:text-white">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2">
            <input
              autoFocus
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="The sharp name of the signal"
              className="field-input"
            />
          </Field>

          <Field label="Type">
            <select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as ItemType }))} className="field-input">
              {ITEM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as Status }))} className="field-input">
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>

          <Field label={`Energy: ${draft.energy}/5`} className="sm:col-span-2">
            <input
              type="range"
              min="1"
              max="5"
              value={draft.energy}
              onChange={(event) => setDraft((current) => ({ ...current, energy: Number(event.target.value) }))}
              className="w-full accent-amber-200"
            />
          </Field>

          <Field label="Tags" className="sm:col-span-2">
            <input value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="x, prompt, project, notion" className="field-input" />
          </Field>

          <Field label="Content" className="sm:col-span-2">
            <textarea
              value={draft.content}
              onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
              placeholder="Raw thought, final copy, image prompt, project note, workflow steps..."
              rows={8}
              className="field-input resize-y"
            />
          </Field>

          <Field label="Next action" className="sm:col-span-2">
            <input
              value={draft.nextAction}
              onChange={(event) => setDraft((current) => ({ ...current, nextAction: event.target.value }))}
              placeholder="The exact next move"
              className="field-input"
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{editing ? "Save Changes" : "Create Item"}</Button>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Future OpenAI API hook: add a server route here later to turn rough content into variants, summaries, image prompts or next actions. The MVP stays browser-only for now.
        </p>
      </form>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mt-4 rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
      <h3 className="text-xl font-semibold tracking-tight text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "solid",
  type = "button"
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "solid" | "ghost";
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
        variant === "solid"
          ? "bg-amber-200 text-slate-950 shadow-lg shadow-amber-950/20 hover:bg-amber-100"
          : "border border-white/10 bg-white/[0.035] text-slate-200 hover:border-amber-300/30 hover:bg-amber-300/10 hover:text-amber-100"
      }`}
    >
      {children}
    </button>
  );
}
