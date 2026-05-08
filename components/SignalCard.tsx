import type { SignalDefinition } from "@/lib/types";

type SignalCardProps = {
  signal: SignalDefinition;
  active: boolean;
  onSelect: () => void;
};

export default function SignalCard({ signal, active, onSelect }: SignalCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group min-h-36 rounded-[1.6rem] border p-4 text-left transition duration-200 active:scale-[0.98] ${
        active
          ? "border-gold/70 bg-gold/10 shadow-glow"
          : "border-ivory/10 bg-ivory/[0.035] hover:border-gold/45 hover:bg-ivory/[0.06]"
      }`}
      aria-pressed={active}
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold/80">
              {signal.eyebrow}
            </span>
            <span className={`h-2 w-2 rounded-full ${active ? "bg-gold" : "bg-ivory/20 group-hover:bg-gold/60"}`} />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-ivory">{signal.type}</h2>
        </div>
        <p className="text-sm leading-5 text-ivory/60">{signal.description}</p>
      </div>
    </button>
  );
}
