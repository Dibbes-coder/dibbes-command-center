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
    <section className="surface-subtle rounded-[1.25rem] p-3.5 sm:p-4">
      <p className="label">Refinement intent</p>
      <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
        {intentOptions.map((intent) => {
          const active = selected.includes(intent);
          return (
            <button
              type="button"
              key={intent}
              onClick={() => toggle(intent)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.98] sm:px-3.5 sm:text-[13px] ${
                active
                  ? "border-gold/45 bg-gold/[0.095] text-gold shadow-[0_0_24px_rgba(196,167,106,0.1)]"
                  : "border-ivory/[0.08] bg-black/10 text-ivory/50 hover:border-ivory/[0.18] hover:bg-ivory/[0.035] hover:text-ivory/[0.74]"
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
