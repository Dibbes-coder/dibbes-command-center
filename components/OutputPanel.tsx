type OutputPanelProps = {
  output: string;
  isLoading: boolean;
  onCopy: () => void;
  onSave: () => void;
  onClear: () => void;
  copied: boolean;
  saved: boolean;
};

export default function OutputPanel({ output, isLoading, onCopy, onSave, onClear, copied, saved }: OutputPanelProps) {
  return (
    <section className="surface rounded-[1.8rem] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="label">Output</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-ivory">Result</h2>
        </div>
        <div className="flex rounded-full border border-ivory/10 bg-black/25 p-1">
          <button className="mini-button" type="button" onClick={onCopy} disabled={!output || isLoading}>
            {copied ? "Copied" : "Copy"}
          </button>
          <button className="mini-button" type="button" onClick={onSave} disabled={!output || isLoading}>
            {saved ? "Saved" : "Save"}
          </button>
          <button className="mini-button" type="button" onClick={onClear} disabled={!output || isLoading}>
            Clear
          </button>
        </div>
      </div>

      <div className="min-h-64 rounded-[1.4rem] border border-ivory/10 bg-black/35 p-4">
        {isLoading ? (
          <div className="flex h-52 flex-col items-center justify-center gap-4 text-center text-ivory/60">
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
            <p className="text-sm">Forging signal...</p>
          </div>
        ) : output ? (
          <pre className="whitespace-pre-wrap break-words font-sans text-[15px] leading-7 text-ivory/86">{output}</pre>
        ) : (
          <div className="flex h-52 items-center justify-center text-center text-sm leading-6 text-ivory/40">
            Execute a signal and the result appears here instantly.
          </div>
        )}
      </div>
    </section>
  );
}
