import type { IntentOption, VoiceMode } from "@/lib/types";
import { intentOptions, voiceModes } from "@/lib/storage";

type IntentSelectorProps = {
  intent: string;
  voiceMode: string;
  onIntentChange: (intent: IntentOption) => void;
  onVoiceModeChange: (voiceMode: VoiceMode) => void;
};

export default function IntentSelector({
  intent,
  voiceMode,
  onIntentChange,
  onVoiceModeChange,
}: IntentSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="block">
        <span className="label">Intent</span>
        <select
          value={intent}
          onChange={(event) => onIntentChange(event.target.value as IntentOption)}
          className="field mt-2 cursor-pointer appearance-none"
        >
          {intentOptions.map((option) => (
            <option key={option} value={option} className="bg-[#101010] text-ivory">
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label">Signal mode</span>
        <select
          value={voiceMode}
          onChange={(event) => onVoiceModeChange(event.target.value as VoiceMode)}
          className="field mt-2 cursor-pointer appearance-none"
        >
          {voiceModes.map((option) => (
            <option key={option} value={option} className="bg-[#101010] text-ivory">
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
