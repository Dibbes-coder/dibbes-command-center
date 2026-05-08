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
    <details className="surface-subtle group rounded-[1.25rem] p-3.5 sm:p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <div>
          <p className="label">Brand DNA</p>
          <p className="mt-1 text-xs leading-5 text-ivory/45 sm:text-[13px]">Your creative constraints, remembered.</p>
        </div>
        <span className="rounded-full border border-ivory/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-ivory/45 transition group-hover:border-gold/25 group-hover:text-gold/70 group-open:hidden">Open</span>
        <span className="hidden rounded-full border border-gold/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gold/70 group-open:inline">Close</span>
      </summary>
      <div className="mt-4 grid gap-2.5 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className={field.key === "avoid" || field.key === "coreValues" ? "md:col-span-2" : ""}>
            <span className="label">{field.label}</span>
            <textarea
              className="field mt-2 min-h-20 resize-y text-sm leading-6"
              value={value[field.key]}
              onChange={(event) => onChange({ ...value, [field.key]: event.target.value })}
            />
          </label>
        ))}
      </div>
    </details>
  );
}
