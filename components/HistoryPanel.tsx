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
          Saved outputs persist in localStorage. Save a result, refresh, and it stays here.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              className="rounded-[1.25rem] border border-ivory/10 bg-black/25 p-4 text-left transition hover:border-gold/45 hover:bg-gold/10"
              type="button"
              onClick={() => onRestore(item)}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-ivory">{item.signalType}</span>
                <time className="text-[11px] uppercase tracking-[0.14em] text-ivory/40">
                  {formatTime(item.createdAt)}
                </time>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-ivory/50">{item.output}</p>
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
