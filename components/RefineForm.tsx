"use client";

import IntentSelector from "./IntentSelector";
import type { IntentOption, VoiceMode } from "@/lib/types";

type RefineFormProps = {
  postContext: string;
  roughReply: string;
  intent: string;
  voiceMode: string;
  isLoading: boolean;
  error: string;
  onPostContextChange: (value: string) => void;
  onRoughReplyChange: (value: string) => void;
  onIntentChange: (value: IntentOption) => void;
  onVoiceModeChange: (value: VoiceMode) => void;
  onSubmit: () => void;
};

export default function RefineForm({
  postContext,
  roughReply,
  intent,
  voiceMode,
  isLoading,
  error,
  onPostContextChange,
  onRoughReplyChange,
  onIntentChange,
  onVoiceModeChange,
  onSubmit,
}: RefineFormProps) {
  return (
    <section className="surface rounded-[1.75rem] p-5 sm:p-8">
      <div className="mb-6">
        <p className="label text-gold/70">Input</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ivory">Paste the post. Add your angle.</h2>
      </div>

      <div className="grid gap-5">
        <label className="block">
          <span className="label">X post / context</span>
          <textarea
            value={postContext}
            onChange={(event) => onPostContextChange(event.target.value)}
            placeholder="Paste the X post you want to reply to…"
            rows={7}
            className="field mt-2 resize-none leading-7"
          />
        </label>

        <label className="block">
          <span className="label">My rough reply</span>
          <textarea
            value={roughReply}
            onChange={(event) => onRoughReplyChange(event.target.value)}
            placeholder="Optional: paste your rough reply…"
            rows={4}
            className="field mt-2 resize-none leading-7"
          />
        </label>

        <IntentSelector
          intent={intent}
          voiceMode={voiceMode}
          onIntentChange={onIntentChange}
          onVoiceModeChange={onVoiceModeChange}
        />

        {error ? (
          <p className="rounded-[1rem] border border-red-300/20 bg-red-400/10 p-4 text-sm leading-6 text-red-100">{error}</p>
        ) : null}

        <button
          type="button"
          disabled={isLoading || !postContext.trim()}
          onClick={onSubmit}
          className="instrument-button rounded-full px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-[#120f08] transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Sharpening signal…" : "Refine Reply"}
        </button>
      </div>
    </section>
  );
}
