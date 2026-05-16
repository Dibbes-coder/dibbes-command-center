"use client";

import type { VoiceProfile } from "@/lib/types";

type VoiceSettingsProps = {
  profile: VoiceProfile;
  onChange: (profile: VoiceProfile) => void;
};

const fields: Array<{ key: keyof VoiceProfile; label: string; rows?: number }> = [
  { key: "handle", label: "User handle" },
  { key: "coreTone", label: "Core tone", rows: 3 },
  { key: "avoid", label: "Things to avoid", rows: 3 },
  { key: "signaturePhrases", label: "Signature phrases", rows: 2 },
  { key: "preferredLength", label: "Preferred reply length", rows: 2 },
  { key: "personalStance", label: "Personal stance", rows: 3 },
];

export default function VoiceSettings({ profile, onChange }: VoiceSettingsProps) {
  function updateField(key: keyof VoiceProfile, value: string) {
    onChange({ ...profile, [key]: value });
  }

  return (
    <details className="surface-subtle group rounded-[1.75rem] p-5 sm:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <div>
          <p className="label text-gold/70">Voice memory</p>
          <h2 className="mt-2 text-xl font-semibold text-ivory">Voice Settings</h2>
          <p className="mt-2 text-sm leading-6 text-stone-400">Saved locally on this device. No account needed.</p>
        </div>
        <span className="rounded-full border border-gold/20 px-3 py-1.5 text-xs font-semibold text-gold transition group-open:rotate-45">
          +
        </span>
      </summary>

      <div className="mt-6 grid gap-4">
        {fields.map((field) => (
          <label key={field.key} className="block">
            <span className="label">{field.label}</span>
            {field.rows ? (
              <textarea
                value={profile[field.key]}
                rows={field.rows}
                onChange={(event) => updateField(field.key, event.target.value)}
                className="field mt-2 resize-none text-sm leading-6"
              />
            ) : (
              <input
                value={profile[field.key]}
                onChange={(event) => updateField(field.key, event.target.value)}
                className="field mt-2 text-sm"
              />
            )}
          </label>
        ))}
      </div>
    </details>
  );
}
