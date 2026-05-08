"use client";

import { intentOptions } from "@/lib/storage";
import type { RefinementIntent } from "@/lib/types";

export default function IntentSelector({ selected, onChange }: { selected: RefinementIntent[]; onChange: (value: RefinementIntent[]) => void }) {
  function toggle(intent: RefinementIntent) {
    if (selected.includes(intent)) {
      onChange(selected.filter((item) => item !== intent));
      return;
    }

    onChange([...selected, intent]);
  }

  return (
    <section className="surface rounded-[1.7rem] p-4 sm:p-5">
      <p className="label">Refinement intent</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {intentOptions.map((intent) => {
          const active = selected.includes(intent);
          return (
            <button
              type="button"
              key={intent}
              onClick={() => toggle(intent)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                active
                  ? "border-gold/70 bg-gold/15 text-gold shadow-glow"
                  : "border-ivory/10 bg-ivory/[0.035] text-ivory/60 hover:border-ivory/25 hover:text-ivory"
              }`}
            >
              {intent}
            </button>
          );
        })}
      </div>
    </section>
  );
}
