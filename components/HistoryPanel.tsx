import type { SavedResult } from "@/lib/types";

type HistoryPanelProps = {
  items: SavedResult[];
  onRestore: (item: SavedResult) => void;
  onClearHistory: () => void;
};

export default function HistoryPanel({ items, onRestore, onClearHistory }: HistoryPanelProps) {
  return (
    <section className="surface rounded-[1.8rem] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="label">Saved</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-ivory">History</h2>
        </div>
        <button
          className="rounded-full border border-ivory/10 px-3 py-2 text-xs font-bold text-ivory/50 transition hover:border-gold/40 hover:text-gold disabled:opacity-30"
          type="button"
          onClick={onClearHistory}
          disabled={items.length === 0}
        >
          Clear all
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[1.4rem] border border-dashed border-ivory/10 p-5 text-sm leading-6 text-ivory/40">
          Saved outputs persist in localStorage. Image results reopen with their prompt, rationale, and preview when storage allows.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              className="grid grid-cols-[auto_1fr] gap-3 rounded-[1.25rem] border border-ivory/10 bg-black/25 p-3 text-left transition hover:border-gold/45 hover:bg-gold/10"
              type="button"
              onClick={() => onRestore(item)}
            >
              {item.kind === "image" ? (
                <div className="h-16 w-12 overflow-hidden rounded-xl border border-ivory/10 bg-ivory/[0.04]">
                  {item.imageDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="h-full w-full object-cover" src={item.imageDataUrl} alt="Saved visual preview" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase tracking-widest text-gold/70">
                      IMG
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-16 w-12 items-center justify-center rounded-xl border border-ivory/10 bg-ivory/[0.04] text-[10px] font-black uppercase tracking-widest text-ivory/45">
                  TXT
                </div>
              )}
              <div className="min-w-0 py-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-bold text-ivory">{item.signalType}</span>
                  <time className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-ivory/40">
                    {formatTime(item.createdAt)}
                  </time>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-ivory/50">{item.preview || item.output}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
