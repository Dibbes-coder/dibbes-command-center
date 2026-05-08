"use client";

import { exampleInputs } from "@/lib/storage";

export default function RefineInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <section className="surface rounded-[2rem] p-4 shadow-glow sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label">Raw material</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ivory">Paste what already exists.</h2>
        </div>
        <span className="hidden text-xs uppercase tracking-[0.2em] text-gold/70 sm:block">Reveal the signal</span>
      </div>
      <textarea
        className="field mt-5 min-h-60 resize-y text-base leading-7 sm:text-lg"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste a rough thought, draft, post, prompt, idea, caption, product message, or brand sentence…"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(exampleInputs).map(([label, example]) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(example)}
            className="rounded-full border border-ivory/10 bg-black/20 px-3 py-2 text-xs font-semibold text-ivory/55 transition hover:border-gold/40 hover:text-gold"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
