import type { RefinementResult } from "@/lib/types";
import CopyButton from "./CopyButton";
import DownloadButton from "./DownloadButton";
import QualityScore from "./QualityScore";

export default function OutputCards({ result }: { result: RefinementResult }) {
  const fullOutput = formatFullOutput(result);
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
      <article className="surface rounded-[1.7rem] border-gold/25 bg-gold/[0.045] p-4 sm:p-5 md:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label text-gold/70">Full Output</p>
            <p className="mt-1 text-sm text-ivory/55">Copy everything or save a text file before starting a new request.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={fullOutput} label="Copy all" />
            <DownloadButton value={fullOutput} filename="dibbes-refine-output.txt" />
          </div>
        </div>
      </article>

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

function formatFullOutput(result: RefinementResult) {
  const sections: Array<[string, string]> = [
    ["Original Input", result.original_input],
    ["Best Refined Version", result.refined_best],
    ["Sharper Version", result.refined_sharp],
    ["Concise Version", result.refined_concise],
    ["Premium Version", result.refined_premium],
    ["Human Version", result.refined_human],
    ["Hooks", result.hook_options.map((hook) => `• ${hook}`).join("\n")],
    ["Visual Direction", result.visual_direction],
    ["Image Prompt", result.image_prompt],
    ["Quality Score", `${result.quality_score}/100`],
    [
      "Quality Breakdown",
      Object.entries(result.quality_breakdown)
        .map(([label, score]) => `• ${label.replaceAll("_", " ")}: ${score}/100`)
        .join("\n"),
    ],
    ["Why It Works", result.why_it_works],
    ["What Changed", result.what_changed.map((change) => `• ${change}`).join("\n")],
    ["Next Suggestion", result.next_suggestion],
  ];

  return sections.map(([label, value]) => `${label}\n${"=".repeat(label.length)}\n${value}`).join("\n\n");
}
