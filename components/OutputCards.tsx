import type { RefinementResult } from "@/lib/types";
import CopyButton from "./CopyButton";
import QualityScore from "./QualityScore";

export default function OutputCards({ result }: { result: RefinementResult }) {
  const cards = [
    ["Best Refined Version", result.refined_best],
    ["Sharper Version", result.refined_sharp],
    ["Concise Version", result.refined_concise],
    ["Premium Version", result.refined_premium],
    ["Human Version", result.refined_human],
    ["Hooks", result.hook_options.map((hook) => `• ${hook}`).join("\n")],
    ["Visual Direction", result.visual_direction],
    ["Image Prompt", result.image_prompt],
    ["Why It Works", result.why_it_works],
    ["What Changed", result.what_changed.map((change) => `• ${change}`).join("\n")],
    ["Next Suggestion", result.next_suggestion],
  ] as const;

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {cards.slice(0, 8).map(([label, value], index) => (
        <TextCard key={label} label={label} value={value} featured={index === 0} />
      ))}
      <div className="md:col-span-2">
        <QualityScore score={result.quality_score} breakdown={result.quality_breakdown} />
      </div>
      {cards.slice(8).map(([label, value]) => (
        <TextCard key={label} label={label} value={value} />
      ))}
    </section>
  );
}

function TextCard({ label, value, featured = false }: { label: string; value: string; featured?: boolean }) {
  return (
    <article className={`surface rounded-[1.7rem] p-4 sm:p-5 ${featured ? "md:col-span-2 border-gold/25 bg-gold/[0.055]" : ""}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="label text-gold/70">{label}</p>
        <CopyButton value={value} />
      </div>
      <p className={`whitespace-pre-wrap leading-7 ${featured ? "text-xl tracking-[-0.025em] text-ivory sm:text-2xl sm:leading-9" : "text-sm text-ivory/72"}`}>{value}</p>
    </article>
  );
}
