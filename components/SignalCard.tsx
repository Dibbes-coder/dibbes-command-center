import type { SignalDefinition, SignalType } from "@/lib/signals";

export function SignalCard({
  signal,
  selected,
  onSelect,
}: {
  signal: SignalDefinition;
  selected: boolean;
  onSelect: (signalType: SignalType) => void;
}) {
  return (
    <button
      className={`min-h-28 rounded-3xl border p-4 text-left transition active:scale-[0.99] ${
        selected
          ? "border-amber-300/70 bg-amber-300/10 shadow-2xl shadow-amber-950/20"
          : "border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.07]"
      }`}
      onClick={() => onSelect(signal.type)}
    >
      <div className={`mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r ${signal.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-white">{signal.shortLabel}</h2>
        {selected ? <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">Active</span> : null}
      </div>
      <p className="mt-2 text-sm leading-5 text-zinc-500">{signal.description}</p>
    </button>
  );
}
