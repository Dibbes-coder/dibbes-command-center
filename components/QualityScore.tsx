import type { QualityBreakdown } from "@/lib/types";

const labels: Array<[keyof QualityBreakdown, string]> = [
  ["clarity", "Clarity"],
  ["originality", "Originality"],
  ["emotional_resonance", "Emotional resonance"],
  ["human_feel", "Human feel"],
  ["brand_alignment", "Brand alignment"],
  ["commercial_usefulness", "Commercial usefulness"],
  ["shareability", "Shareability"],
  ["visual_potential", "Visual potential"],
];

export default function QualityScore({ score, breakdown }: { score: number; breakdown: QualityBreakdown }) {
  return (
    <div className="rounded-[1.4rem] border border-gold/20 bg-gold/[0.07] p-5">
      <p className="label text-gold/70">Quality Score</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-6xl font-semibold tracking-[-0.08em] text-gold">{score}</span>
        <span className="pb-2 text-sm text-ivory/45">/ 100</span>
      </div>
      <div className="mt-5 grid gap-3">
        {labels.map(([key, label]) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-xs text-ivory/50">
              <span>{label}</span>
              <span>{breakdown[key]}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ivory/10">
              <div className="h-full rounded-full bg-gold" style={{ width: `${breakdown[key]}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
