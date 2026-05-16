import type { RefineResult } from "@/lib/types";
import ReplyBlock from "./ReplyBlock";

type OutputCardProps = {
  result: RefineResult | null;
};

export default function OutputCard({ result }: OutputCardProps) {
  if (!result) {
    return (
      <section className="surface rounded-[1.75rem] p-6 sm:p-8">
        <p className="label text-gold/70">Output</p>
        <div className="mt-10 rounded-[1.35rem] border border-dashed border-gold/20 bg-black/20 p-8 text-center">
          <p className="text-lg font-medium text-ivory">Paste a post. Get the reply that makes people check your profile.</p>
          <p className="mt-3 text-sm leading-6 text-stone-400">Your refined replies, quote angle, warning, and quality score will appear here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="surface rounded-[1.75rem] p-5 sm:p-8">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label text-gold/70">Refined output</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ivory">Reply options with taste.</h2>
        </div>
        <div className="rounded-full border border-gold/20 px-4 py-2 text-sm text-gold">
          Score {result.qualityScore.score}/100
        </div>
      </div>

      <div className="grid gap-4">
        <ReplyBlock title="Best Reply" reply={result.bestReply} />
        <ReplyBlock title="Sharper Reply" reply={result.sharperReply} />
        <ReplyBlock title="Warmer Reply" reply={result.warmerReply} />
        <ReplyBlock title="Bolder Reply" reply={result.bolderReply} />
        <ReplyBlock title="Quote Post Angle" reply={result.quotePostAngle} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[1.35rem] border border-amber-300/15 bg-amber-300/[0.04] p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-amber-200">Don’t Post This If…</h3>
          <p className="mt-3 text-sm leading-6 text-stone-300">{result.dontPostIf}</p>
        </section>

        <section className="rounded-[1.35rem] border border-gold/15 bg-black/25 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-ivory">Quality Score</h3>
          <p className="mt-3 text-3xl font-semibold text-gold">{result.qualityScore.score}</p>
          <p className="mt-3 text-sm leading-6 text-stone-300">{result.qualityScore.reason}</p>
          <p className="mt-3 text-sm leading-6 text-stone-400">Tip: {result.qualityScore.improvementTip}</p>
        </section>
      </div>
    </section>
  );
}
