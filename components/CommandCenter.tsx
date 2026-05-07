"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ITEM_ENERGIES,
  ITEM_STATUSES,
  ITEM_TYPES,
  emptyDraft,
  itemToDraft,
  makeItem,
  markItemExecuted,
  parseTags,
  readableDate,
  reviseItem,
  type CommandItem,
  type ItemDraft,
  type ItemEnergy,
  type ItemStatus,
  type ItemType,
} from "@/lib/items";
import { deleteAllItems, downloadItems, loadItems, saveItems, seedSampleItems } from "@/lib/storage";

type ViewMode = "All" | "Ready to Ship" | "Raw Signals" | "Prompt Lab" | "Executed";
type SelectAll<T extends string> = "All" | T;

type OpenAIExecutionResponse = {
  ok: boolean;
  text?: string;
  model?: string;
  error?: string;
};

type Filters = {
  query: string;
  type: SelectAll<ItemType>;
  status: SelectAll<ItemStatus>;
  tag: string;
  view: ViewMode;
};

const initialFilters: Filters = {
  query: "",
  type: "All",
  status: "All",
  tag: "All",
  view: "All",
};

const viewHelp: Record<ViewMode, string> = {
  All: "Everything in your local command center.",
  "Ready to Ship": "Items polished enough to copy, publish, or run now.",
  "Raw Signals": "Unrefined ideas that need a next action.",
  "Prompt Lab": "Prompts and AI workflows ready to test with a model.",
  Executed: "Completed moves and notes from what happened.",
};

export default function CommandCenter() {
  const [items, setItems] = useState<CommandItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreatingSignal, setIsCreatingSignal] = useState(false);
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft);
  const [tagText, setTagText] = useState("");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [executionItem, setExecutionItem] = useState<CommandItem | null>(null);
  const [executionNotes, setExecutionNotes] = useState("");
  const [clipboardNotice, setClipboardNotice] = useState("");
  const [openAIExecutionText, setOpenAIExecutionText] = useState("");
  const [openAIExecutionModel, setOpenAIExecutionModel] = useState("");
  const [openAIExecutionStatus, setOpenAIExecutionStatus] = useState("");
  const [isOpenAIExecuting, setIsOpenAIExecuting] = useState(false);
  const [litButton, setLitButton] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const lightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<HTMLElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const stored = loadItems();
    setItems(stored);
    setActiveId(null);
  }, []);

  useEffect(() => {
    return () => {
      if (lightTimeoutRef.current) clearTimeout(lightTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [activeId, items],
  );
  const isSignalEditorOpen = Boolean(activeItem || isCreatingSignal);

  useEffect(() => {
    if (!isSignalEditorOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSignalDetail();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isSignalEditorOpen]);

  useEffect(() => {
    if (!activeItem) {
      if (!isCreatingSignal) {
        setDraft(emptyDraft);
        setTagText("");
      }
      return;
    }

    const nextDraft = itemToDraft(activeItem);
    setDraft(nextDraft);
    setTagText(nextDraft.tags.join(", "));
  }, [activeItem, isCreatingSignal]);

  const tags = useMemo(
    () => Array.from(new Set(items.flatMap((item) => item.tags))).sort(),
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
        item.executionNotes,
      ]
        .join(" ")
        .toLowerCase();

      if (query && !searchText.includes(query)) return false;
      if (filters.type !== "All" && item.type !== filters.type) return false;
      if (filters.status !== "All" && item.status !== filters.status) return false;
      if (filters.tag !== "All" && !item.tags.includes(filters.tag)) return false;
      if (filters.view === "Ready to Ship" && item.status !== "Ready to Ship") return false;
      if (filters.view === "Raw Signals" && item.status !== "Raw") return false;
      if (filters.view === "Prompt Lab" && item.type !== "Prompt" && item.type !== "AI Workflow") return false;
      if (filters.view === "Executed" && item.status !== "Executed") return false;

      return true;
    });
  }, [filters, items]);

  function persist(nextItems: CommandItem[]) {
    setItems(nextItems);
    saveItems(nextItems);
  }

  function updateDraft<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function triggerButtonLight(key: string) {
    if (lightTimeoutRef.current) clearTimeout(lightTimeoutRef.current);

    setLitButton(null);
    requestAnimationFrame(() => setLitButton(key));
    lightTimeoutRef.current = setTimeout(() => setLitButton(null), 700);
  }

  function showSavedToast() {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    setToastMessage("✓ Signal saved");
    toastTimeoutRef.current = setTimeout(() => setToastMessage(""), 2400);
  }

  function openSignalDetail(item: CommandItem) {
    setIsCreatingSignal(false);
    setActiveId(item.id);
  }

  function closeSignalDetail() {
    setIsCreatingSignal(false);
    setActiveId(null);
    setDraft(emptyDraft);
    setTagText("");
  }

  function createBlankItem() {
    triggerButtonLight("capture");
    setIsCreatingSignal(true);
    setActiveId(null);
    setDraft({
      ...emptyDraft,
      title: "",
      content: "",
      nextAction: "",
    });
    setTagText("");

    requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });
  }

  function saveDraft() {
    triggerButtonLight("save");
    const nextDraft = { ...draft, tags: parseTags(tagText) };

    if (!activeItem) {
      const item = makeItem(nextDraft);
      persist([item, ...items]);
      setActiveId(item.id);
      setIsCreatingSignal(false);
      showSavedToast();
      return;
    }

    persist(items.map((item) => (item.id === activeItem.id ? reviseItem(item, nextDraft) : item)));
    setIsCreatingSignal(false);
    showSavedToast();
  }

  function requestDeleteItem(item: CommandItem) {
    const confirmed = window.confirm(`Delete "${item.title}"? This removes it from localStorage immediately.`);
    if (!confirmed) return;

    const nextItems = items.filter((current) => current.id !== item.id);
    persist(nextItems);
    if (activeId === item.id) {
      setActiveId(nextItems[0]?.id ?? null);
      setIsCreatingSignal(false);
    }
    if (executionItem?.id === item.id) setExecutionItem(null);
  }

  function requestDeleteAllData() {
    const confirmed = window.confirm(
      "Delete ALL Dibbes Command Center data from this browser? This cannot be undone. Export JSON first if you need a backup.",
    );
    if (!confirmed) return;

    deleteAllItems();
    setItems([]);
    setActiveId(null);
    setIsCreatingSignal(false);
    setExecutionItem(null);
  }

  function restoreSamples() {
    const seeded = seedSampleItems();
    setItems(seeded);
    setActiveId(seeded[0]?.id ?? null);
    setIsCreatingSignal(false);
  }

  function openExecution(item: CommandItem) {
    setExecutionItem(item);
    setExecutionNotes(item.executionNotes);
    setClipboardNotice("");
    setOpenAIExecutionText("");
    setOpenAIExecutionModel("");
    setOpenAIExecutionStatus("");
  }

  function saveExecutionNotes() {
    if (!executionItem) return;

    const updated = reviseItem(executionItem, {
      ...itemToDraft(executionItem),
      executionNotes,
    });
    persist(items.map((item) => (item.id === updated.id ? updated : item)));
    setExecutionItem(updated);
  }

  function markExecuted() {
    if (!executionItem) return;

    const updated = markItemExecuted(executionItem, executionNotes);
    persist(items.map((item) => (item.id === updated.id ? updated : item)));
    setExecutionItem(updated);
    setActiveId(updated.id);
    setClipboardNotice("Marked executed.");
  }

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setClipboardNotice(`${label} copied to clipboard.`);
    } catch {
      setClipboardNotice("Clipboard copy failed. Select the text and copy it manually.");
    }
  }

  async function generateOpenAIExecution() {
    if (!executionItem) return;

    setIsOpenAIExecuting(true);
    setOpenAIExecutionStatus("Generating with OpenAI...");
    setClipboardNotice("");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: executionItem, mode: executionContent?.title ?? "execute" }),
      });
      const payload = (await response.json()) as OpenAIExecutionResponse;

      if (!response.ok || !payload.ok || !payload.text) {
        throw new Error(payload.error ?? "OpenAI execution failed.");
      }

      setOpenAIExecutionText(payload.text);
      setOpenAIExecutionModel(payload.model ?? "OpenAI");
      setOpenAIExecutionStatus("OpenAI execution ready. Review, copy, then save notes or mark executed.");
    } catch (error) {
      setOpenAIExecutionStatus(error instanceof Error ? error.message : "OpenAI execution failed.");
    } finally {
      setIsOpenAIExecuting(false);
    }
  }

  const executionContent = executionItem ? buildExecutionContent(executionItem) : null;

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
                Add, execute, and store useful work. Capture signals, turn them into
                action, and keep the execution record in this browser.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className={`btn-primary ${litButton === "capture" ? "button-light-burst" : ""}`} onClick={createBlankItem}>Capture signal</button>
              <button className="btn-secondary" onClick={() => downloadItems(items)}>Export JSON</button>
              <button className="btn-secondary" onClick={restoreSamples}>Seed samples</button>
              <button className="btn-danger" onClick={requestDeleteAllData}>Delete all data</button>
            </div>
          </div>
        </header>

        <section className="surface rounded-[2rem] p-5 text-sm leading-6 text-zinc-400">
          <h2 className="text-base font-semibold text-white">Add. Execute. Store.</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <FlowStep title="Add" text="Capture a raw signal, prompt, post, project, or idea before it disappears." />
            <FlowStep title="Execute" text="Open the execution panel to copy a local output or generate one with OpenAI." />
            <FlowStep title="Store" text="Save execution notes, mark the item executed, and keep everything in localStorage." />
          </div>
        </section>

        <section className="grid gap-4">
          <aside className="surface rounded-[2rem] p-4">
            <div className="grid gap-3">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-600" htmlFor="signal-search">
                  Find
                </label>
                <input
                  id="signal-search"
                  className="mt-2 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-700 focus:placeholder:text-zinc-600"
                  aria-label="Search saved items"
                  placeholder="Search saved signals..."
                  value={filters.query}
                  onChange={(event) => setFilters({ ...filters, query: event.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["All", "Ready to Ship", "Raw Signals", "Prompt Lab", "Executed"] as ViewMode[]).map((view) => (
                  <button
                    key={view}
                    title={viewHelp[view]}
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
              <details className="rounded-3xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-500">
                <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Refine search
                </summary>
                <div className="mt-4 grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Type"
                      help="What kind of work this is. Execution changes by type."
                      value={filters.type}
                      options={["All", ...ITEM_TYPES]}
                      onChange={(value) => setFilters({ ...filters, type: value as SelectAll<ItemType> })}
                    />
                    <Select
                      label="Status"
                      help="Where this item is in the capture → execute loop."
                      value={filters.status}
                      options={["All", ...ITEM_STATUSES]}
                      onChange={(value) => setFilters({ ...filters, status: value as SelectAll<ItemStatus> })}
                    />
                  </div>
                  <Select
                    label="Tag"
                    help="Use tags to group themes, clients, campaigns, or models."
                    value={filters.tag}
                    options={["All", ...tags]}
                    onChange={(value) => setFilters({ ...filters, tag: value })}
                  />
                </div>
              </details>
              <p className="text-xs leading-5 text-zinc-500">{viewHelp[filters.view]}</p>
            </div>

            <div className="mt-4 space-y-3">
              {visibleItems.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-3xl border p-4 transition hover:border-amber-300/50 ${
                    activeId === item.id ? "border-amber-300/70 bg-amber-300/10" : "border-white/10 bg-black/25"
                  }`}
                >
                  <button className="w-full text-left" onClick={() => openSignalDetail(item)}>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold text-white">{item.title}</h2>
                      <span className="chip shrink-0">{item.energy}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">{item.content}</p>
                  </button>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="chip">{item.type}</span>
                    <span className="chip">{item.status}</span>
                    {item.tags.slice(0, 2).map((tag) => <span className="chip" key={tag}>#{tag}</span>)}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:flex">
                    <button className="btn-primary px-4 py-2" onClick={() => openExecution(item)}>Execute</button>
                    <button className="btn-danger px-4 py-2" onClick={() => requestDeleteItem(item)}>Delete</button>
                  </div>
                </article>
              ))}
              {visibleItems.length === 0 ? <EmptyState onCreate={createBlankItem} /> : null}
            </div>
          </aside>

          {isSignalEditorOpen ? (
            <div
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 backdrop-blur sm:items-center sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="signal-editor-title"
              onClick={closeSignalDetail}
            >
              <section
                ref={editorRef}
                className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-black sm:p-7"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="label">Editor</p>
                    <h2 id="signal-editor-title" className="mt-2 text-3xl font-semibold tracking-tight text-white">
                      {activeItem ? "Refine item" : "Capture signal"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">Add every detail here first. Nothing is stored until you press Save.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button className={`btn-primary ${litButton === "save" ? "button-light-burst" : ""}`} onClick={saveDraft}>Save signal</button>
                    <button className="btn-secondary" disabled={!activeItem} onClick={() => activeItem && openExecution(activeItem)}>Execute</button>
                    <button className="btn-secondary" onClick={closeSignalDetail}>Cancel</button>
                    <button className="btn-danger" disabled={!activeItem} onClick={() => activeItem && requestDeleteItem(activeItem)}>Delete</button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="label md:col-span-2">
                    Title
                    <span className="mt-1 block normal-case tracking-normal text-zinc-500">A plain-language name you can recognize later.</span>
                    <input ref={titleInputRef} className="field mt-2" value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} />
                  </label>
                  <Select label="Type" help="Choose the closest execution format." value={draft.type} options={ITEM_TYPES} onChange={(value) => updateDraft("type", value as ItemType)} />
                  <Select label="Status" help="Use Ready to Ship when it is ready to execute." value={draft.status} options={ITEM_STATUSES} onChange={(value) => updateDraft("status", value as ItemStatus)} />
                  <Select label="Energy" help="How much attention this deserves." value={draft.energy} options={ITEM_ENERGIES} onChange={(value) => updateDraft("energy", value as ItemEnergy)} />
                  <label className="label">
                    Tags
                    <span className="mt-1 block normal-case tracking-normal text-zinc-500">Comma-separated labels like launch, ai, content.</span>
                    <input className="field mt-2" placeholder="ai, launch, prompt" value={tagText} onChange={(event) => setTagText(event.target.value)} />
                  </label>
                  <label className="label md:col-span-2">
                    Content
                    <span className="mt-1 block normal-case tracking-normal text-zinc-500">The raw material that execution will turn into copy, prompts, or a checklist.</span>
                    <textarea className="field mt-2 min-h-36 resize-y" value={draft.content} onChange={(event) => updateDraft("content", event.target.value)} />
                  </label>
                  <label className="label md:col-span-2">
                    Next action
                    <span className="mt-1 block normal-case tracking-normal text-zinc-500">The next concrete move.</span>
                    <textarea className="field mt-2 min-h-24 resize-y" value={draft.nextAction} onChange={(event) => updateDraft("nextAction", event.target.value)} />
                  </label>
                  <label className="label md:col-span-2">
                    Execution notes
                    <span className="mt-1 block normal-case tracking-normal text-zinc-500">What happened when you used this item. Also editable in the execution panel.</span>
                    <textarea className="field mt-2 min-h-24 resize-y" value={draft.executionNotes} onChange={(event) => updateDraft("executionNotes", event.target.value)} />
                  </label>
                </div>

                <div className="mt-6 grid gap-3 rounded-3xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-400 sm:grid-cols-2">
                  <p>Created: {activeItem ? readableDate(activeItem.createdAt) : "On save"}</p>
                  <p>Updated: {activeItem ? readableDate(activeItem.updatedAt) : "On save"}</p>
                </div>

                <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm leading-6 text-amber-100/80">
                  {/* Future OpenAI API integration point: summarize content, generate tags, improve prompts, or suggest the next action from this draft. */}
                  OpenAI integration point reserved for future classify, summarize, rewrite,
                  prompt-expand, and next-action generation flows. Configure OPENAI_API_KEY to generate execution-ready drafts with OpenAI.
                </div>
              </section>
            </div>
          ) : null}
        </section>
      </div>

      {toastMessage ? (
        <div className="pointer-events-none fixed right-4 top-4 z-[60] rounded-full border border-emerald-300/30 bg-emerald-300/15 px-5 py-3 text-sm font-semibold text-emerald-100 shadow-2xl shadow-emerald-950/40 backdrop-blur toast-checkmark">
          {toastMessage}
        </div>
      ) : null}

      {executionItem && executionContent ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 backdrop-blur sm:items-center sm:p-6" role="dialog" aria-modal="true">
          <section className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-black sm:p-7">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="label">Execution panel</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{executionItem.title}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="chip">{executionItem.type}</span>
                  <span className="chip">{executionItem.status}</span>
                  <span className="chip">Updated {readableDate(executionItem.updatedAt)}</span>
                </div>
              </div>
              <button className="btn-secondary" onClick={() => setExecutionItem(null)}>Close</button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                <h3 className="font-semibold text-white">Source</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{executionItem.content}</p>
                <h3 className="mt-5 font-semibold text-white">Next action</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{executionItem.nextAction || "Add a next action before execution."}</p>
              </div>

              <div className="rounded-3xl border border-amber-300/20 bg-amber-300/5 p-4">
                <h3 className="font-semibold text-white">{executionContent.title}</h3>
                <p className="mt-2 text-sm leading-6 text-amber-100/75">{executionContent.help}</p>
                {executionContent.mode === "checklist" ? (
                  <ul className="mt-4 space-y-3 text-sm text-zinc-200">
                    {executionContent.checklist.map((step) => (
                      <li className="flex gap-3" key={step}><span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />{step}</li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <textarea className="field mt-4 min-h-56 resize-y" readOnly value={executionContent.text} />
                    <button className="btn-primary mt-4" onClick={() => void copyText(executionContent.text, executionContent.copyLabel)}>
                      {executionContent.buttonLabel}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-sky-300/20 bg-sky-300/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-white">OpenAI API execution</h3>
                  <p className="mt-2 text-sm leading-6 text-sky-100/75">
                    Generate a sharper execution draft with the server-side OpenAI Responses API. Requires OPENAI_API_KEY.
                  </p>
                </div>
                <button className="btn-secondary" disabled={isOpenAIExecuting} onClick={() => void generateOpenAIExecution()}>
                  {isOpenAIExecuting ? "Generating..." : "Generate with OpenAI"}
                </button>
              </div>
              {openAIExecutionStatus ? <p className="mt-3 text-sm text-sky-100/80">{openAIExecutionStatus}</p> : null}
              {openAIExecutionText ? (
                <>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span className="chip">Model: {openAIExecutionModel || "OpenAI"}</span>
                    <span>Review before publishing or using externally.</span>
                  </div>
                  <textarea className="field mt-3 min-h-56 resize-y" value={openAIExecutionText} onChange={(event) => setOpenAIExecutionText(event.target.value)} />
                  <button className="btn-primary mt-4" onClick={() => void copyText(openAIExecutionText, "OpenAI execution")}>Copy OpenAI output</button>
                </>
              ) : null}
            </div>

            <label className="label mt-5 block">
              Execution notes
              <span className="mt-1 block normal-case tracking-normal text-zinc-500">Save outcomes, edits, links, or what to do differently next time.</span>
              <textarea className="field mt-2 min-h-28 resize-y" value={executionNotes} onChange={(event) => setExecutionNotes(event.target.value)} />
            </label>

            {clipboardNotice ? <p className="mt-4 text-sm text-emerald-300">{clipboardNotice}</p> : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn-secondary" onClick={saveExecutionNotes}>Save notes</button>
              <button className="btn-primary" onClick={markExecuted}>Mark executed</button>
              <button className="btn-danger" onClick={() => requestDeleteItem(executionItem)}>Delete item</button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 p-6 text-sm leading-6 text-zinc-500">
      <h2 className="text-base font-semibold text-white">No matching items.</h2>
      <p className="mt-2">Capture a raw signal, refine it into a useful format, execute or copy it, then mark it ready or executed.</p>
      <button className="btn-primary mt-4" onClick={onCreate}>Capture raw signal</button>
    </div>
  );
}

function FlowStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
      <p className="text-sm font-semibold text-amber-200">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );
}


function Select({
  label,
  help,
  value,
  options,
  onChange,
}: {
  label: string;
  help: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="label" title={help}>
      {label}
      <span className="mt-1 block normal-case tracking-normal text-zinc-500">{help}</span>
      <select className="field mt-2" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

type ExecutionContent =
  | { mode: "copy"; title: string; help: string; text: string; buttonLabel: string; copyLabel: string }
  | { mode: "checklist"; title: string; help: string; checklist: string[] };

function buildExecutionContent(item: CommandItem): ExecutionContent {
  if (item.type === "X Post") {
    return {
      mode: "copy",
      title: "Copy-ready X post",
      help: "A polished post draft based on the saved content and next action.",
      text: polishPost(item),
      buttonLabel: "Copy post",
      copyLabel: "Post",
    };
  }

  if (item.type === "Image Prompt") {
    return {
      mode: "copy",
      title: "Copy-ready image prompt",
      help: "Paste this into your image model and iterate from there.",
      text: `Create an image with this direction:\n\n${item.content}\n\nStyle: premium, precise, cinematic, high contrast, minimal clutter.\nMust include: ${item.nextAction || "a clear visual focal point"}.\nAvoid: noisy composition, generic stock-photo styling, unreadable UI text.`,
      buttonLabel: "Copy prompt",
      copyLabel: "Image prompt",
    };
  }

  if (item.type === "Prompt" || item.type === "AI Workflow") {
    return {
      mode: "copy",
      title: item.type === "Prompt" ? "Copy-ready prompt" : "Copy-ready AI workflow",
      help: "Paste this into your AI tool as the working instruction.",
      text: `Goal:\n${item.title}\n\nContext:\n${item.content}\n\nTask:\n${item.nextAction || "Produce the best next useful output."}\n\nOutput format:\n- Summary\n- Recommended action\n- Risks or missing information\n- Final answer ready to use`,
      buttonLabel: "Copy to clipboard",
      copyLabel: item.type,
    };
  }

  return {
    mode: "checklist",
    title: "Execution checklist",
    help: "A simple checklist generated from the saved fields.",
    checklist: [
      `Clarify the outcome: ${item.title}`,
      `Review the signal: ${item.content || "Add content before executing."}`,
      `Do the next action: ${item.nextAction || "Define the next action."}`,
      `Capture what happened in execution notes.`,
      `Mark this item Executed when complete.`,
    ],
  };
}

function polishPost(item: CommandItem): string {
  const body = item.content.trim();
  const next = item.nextAction.trim();

  return [
    body,
    next ? `\nNext move: ${next}` : "",
    "\nSignal. Speed. Precision.",
  ]
    .filter(Boolean)
    .join("\n");
}
