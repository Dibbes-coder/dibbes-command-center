import type { RefinementResult } from "@/lib/types";

const defaultChanges = [
  "clearer point",
  "stronger rhythm",
  "sharper hook",
  "removed generic wording",
  "improved emotional precision",
  "improved brand fit",
];

export default function BeforeAfter({ result }: { result: RefinementResult }) {
  const changes = result.what_changed.length ? result.what_changed : defaultChanges;

  return (
    <section className="surface rounded-[2rem] p-4 sm:p-6">
      <p className="label">Transformation</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.4rem] border border-ivory/10 bg-black/25 p-4">
          <p className="label">Before</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ivory/55">{result.original_input}</p>
        </div>
        <div className="rounded-[1.4rem] border border-gold/20 bg-gold/[0.06] p-4">
          <p className="label text-gold/70">After</p>
          <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-ivory">{result.refined_best}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {changes.map((change) => (
          <span key={change} className="rounded-full border border-ivory/10 bg-ivory/[0.035] px-3 py-1.5 text-xs text-ivory/55">
            {change}
          </span>
        ))}
      </div>
    </section>
  );
}
