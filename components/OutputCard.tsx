import type { RefineResult } from "@/lib/types";
import ReplyBlock from "./ReplyBlock";

type OutputCardProps = {
  result: RefineResult | null;
};

export default function OutputCard({ result }: OutputCardProps) {
  if (!result) {
    return (
      <section className="surface rounded-[1.4rem] p-6 sm:p-8">
        <div className="flex min-h-[32rem] flex-col justify-between">
          <div>
            <p className="label text-gold/70">Refinery</p>
            <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-[-0.04em] text-ivory sm:text-4xl">
              One clean reply can change the room.
            </h2>
          </div>
          <div className="border-t border-ivory/[0.08] pt-6">
            <p className="text-sm leading-6 text-stone-400">
              Paste, link, or screenshot a post. The refinery will shape replies for relevance, replyability, taste, and signal.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="surface rounded-[1.4rem] p-5 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-ivory/[0.08] pb-5">
        <div>
          <p className="label text-gold/70">Refined signal</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ivory">Choose the cleanest strike.</h2>
        </div>
        <div className="shrink-0 rounded-full border border-gold/20 px-3 py-1.5 text-xs font-semibold text-gold">
          {result.qualityScore.score}/100
        </div>
      </div>

      <div className="grid gap-3">
        <ReplyBlock title="Best" reply={result.bestReply} featured />
        <ReplyBlock title="Sharper" reply={result.sharperReply} />
        <ReplyBlock title="Warmer" reply={result.warmerReply} />
        <ReplyBlock title="Bolder" reply={result.bolderReply} />
        <ReplyBlock title="Quote post" reply={result.quotePostAngle} />
      </div>

      <section className="mt-4 rounded-[1rem] border border-ivory/[0.08] bg-black/20 p-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold/75">Score logic</h3>
          <span className="text-xs text-stone-600">Signal quality</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-stone-300">{result.qualityScore.reason}</p>
        <p className="mt-3 text-sm leading-6 text-stone-500">{result.qualityScore.improvementTip}</p>
      </section>
    </section>
  );
}
