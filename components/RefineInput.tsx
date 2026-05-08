"use client";

import { exampleInputs } from "@/lib/storage";

export default function RefineInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <section className="surface-instrument rounded-[1.45rem] p-3.5 sm:p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label text-gold/[0.62]">Input</p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.035em] text-ivory sm:text-2xl">Paste what already exists.</h2>
        </div>
        <span className="hidden text-[10px] font-black uppercase tracking-[0.22em] text-gold/55 sm:block">Reveal the signal</span>
      </div>
      <textarea
        className="field mt-4 min-h-[13.5rem] resize-y text-[15px] leading-6 sm:min-h-64 sm:text-base sm:leading-7"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste a rough thought, post, prompt, caption, idea, product message, or brand line…"
      />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Object.entries(exampleInputs).map(([label, example]) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(example)}
            className="rounded-full border border-ivory/[0.08] bg-black/15 px-2.5 py-1.5 text-[11px] font-semibold text-ivory/[0.48] transition hover:border-gold/30 hover:bg-gold/[0.04] hover:text-gold/80 active:scale-[0.98]"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
