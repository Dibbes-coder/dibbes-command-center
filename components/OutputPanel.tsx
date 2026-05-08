export function OutputPanel({
  output,
  error,
  loading,
  saved,
  onCopy,
  onSave,
  onRerun,
}: {
  output: string;
  error: string;
  loading: boolean;
  saved: boolean;
  onCopy: () => void;
  onSave: () => void;
  onRerun: () => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/30 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300/80">Output</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Result</h2>
        </div>
        {output ? <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">Ready</span> : null}
      </div>

      <div className="mt-4 min-h-60 rounded-3xl border border-white/10 bg-black/35 p-4">
        {loading ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center text-zinc-400">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
            <p className="mt-4 text-sm">Executing signal…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm leading-6 text-red-100">{error}</div>
        ) : output ? (
          <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-zinc-100">{output}</pre>
        ) : (
          <div className="flex min-h-48 items-center justify-center text-center text-sm leading-6 text-zinc-600">
            Paste raw input, choose a signal, then execute. The result appears here.
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <button className="btn-secondary" disabled={!output || loading} onClick={onCopy}>Copy</button>
        <button className="btn-primary" disabled={!output || loading || saved} onClick={onSave}>{saved ? "Saved" : "Save"}</button>
        <button className="btn-secondary col-span-2" disabled={loading} onClick={onRerun}>Rerun / refine</button>
      </div>
    </section>
  );
}
