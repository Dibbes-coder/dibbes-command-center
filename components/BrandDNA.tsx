"use client";

import type { BrandDNA as BrandDNAType } from "@/lib/types";

const fields: Array<{ key: keyof BrandDNAType; label: string }> = [
  { key: "voice", label: "Voice" },
  { key: "visualStyle", label: "Visual style" },
  { key: "audience", label: "Audience" },
  { key: "coreValues", label: "Core values" },
  { key: "avoid", label: "Avoid" },
  { key: "signatureColors", label: "Signature colors" },
  { key: "energyLevel", label: "Energy level" },
];

export default function BrandDNA({ value, onChange }: { value: BrandDNAType; onChange: (value: BrandDNAType) => void }) {
  return (
    <details className="surface group rounded-[1.7rem] p-4 sm:p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <div>
          <p className="label">Brand DNA</p>
          <p className="mt-2 max-w-2xl text-sm text-ivory/55">Compact creative constraints that keep every refinement aligned to your taste.</p>
        </div>
        <span className="rounded-full border border-gold/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gold/80 group-open:hidden">Open</span>
        <span className="hidden rounded-full border border-gold/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gold/80 group-open:inline">Close</span>
      </summary>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className={field.key === "avoid" || field.key === "coreValues" ? "md:col-span-2" : ""}>
            <span className="label">{field.label}</span>
            <textarea
              className="field mt-2 min-h-24 resize-y text-sm leading-6"
              value={value[field.key]}
              onChange={(event) => onChange({ ...value, [field.key]: event.target.value })}
            />
          </label>
        ))}
      </div>
    </details>
  );
}
