import type { HistoryItem } from "@/lib/types";

type HistoryListProps = {
  history: HistoryItem[];
  onOpen: (item: HistoryItem) => void;
  onClear: () => void;
};

export default function HistoryList({ history, onOpen, onClear }: HistoryListProps) {
  return (
    <section className="surface-subtle rounded-[1.75rem] p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="label text-gold/70">Local history</p>
          <h2 className="mt-2 text-xl font-semibold text-ivory">Last 5 refinements</h2>
        </div>
        {history.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-ivory/10 px-3 py-1.5 text-xs font-semibold text-stone-400 transition hover:border-gold/25 hover:text-gold"
          >
            Clear
          </button>
        ) : null}
      </div>

      {history.length === 0 ? (
        <p className="rounded-[1.15rem] border border-dashed border-gold/15 bg-black/20 p-5 text-sm leading-6 text-stone-400">
          No saved refinements yet. Your next sharpened reply will stay here on this device.
        </p>
      ) : (
        <div className="grid gap-3">
          {history.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onOpen(item)}
              className="rounded-[1.15rem] border border-ivory/10 bg-black/20 p-4 text-left transition hover:border-gold/30 hover:bg-gold/[0.04]"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs uppercase tracking-[0.18em] text-gold/70">{item.intent}</span>
                <span className="text-xs text-stone-500">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-ivory">{item.result.bestReply.text}</p>
              <p className="mt-2 line-clamp-1 text-xs text-stone-500">Context: {item.postContext}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
