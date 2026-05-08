import { formatHistoryTime, type HistoryItem } from "@/lib/storage";

export function HistoryPanel({
  history,
  onOpen,
  onClear,
}: {
  history: HistoryItem[];
  onOpen: (item: HistoryItem) => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">History</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Saved outputs</h2>
        </div>
        {history.length ? <button className="text-xs font-semibold text-zinc-500 transition hover:text-white" onClick={onClear}>Clear</button> : null}
      </div>

      <div className="mt-4 grid gap-3">
        {history.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-white/10 p-4 text-sm leading-6 text-zinc-600">
            Nothing saved yet. Save useful outputs and they will stay in this browser.
          </p>
        ) : (
          history.slice(0, 12).map((item) => (
            <button
              key={item.id}
              className="rounded-3xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-amber-300/40 hover:bg-amber-300/5"
              onClick={() => onOpen(item)}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-white">{item.signalLabel}</span>
                <span className="shrink-0 text-xs text-zinc-600">{formatHistoryTime(item.savedAt)}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-zinc-500">{item.output}</p>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
