import type { SignalDefinition, SignalType } from "./types";

export const signals: SignalDefinition[] = [
  {
    type: "Portrait",
    eyebrow: "Identity",
    description: "Premium portrait prompts from a few raw details.",
    placeholder: "Example: founder, black turtleneck, cinematic, confident, NYC studio...",
  },
  {
    type: "Image Prompt",
    eyebrow: "Visual",
    description: "Sharp image prompts with lighting, framing, and avoids.",
    placeholder: "Example: luxury espresso bar on Mars, quiet morning, editorial photo...",
  },
  {
    type: "X Post",
    eyebrow: "Social",
    description: "Short posts with sharper and calmer variants.",
    placeholder: "Paste your raw idea, launch note, contrarian take, or thread fragment...",
  },
  {
    type: "Meeting Notes",
    eyebrow: "Ops",
    description: "Messy notes into decisions, actions, risks, and follow-up.",
    placeholder: "Paste rough meeting notes, names, decisions, TODOs, blockers, dates...",
  },
  {
    type: "Rewrite",
    eyebrow: "Copy",
    description: "Cleaner, stronger, shorter writing in three passes.",
    placeholder: "Paste the text you want made sharper, shorter, and clearer...",
  },
  {
    type: "Summary",
    eyebrow: "Synthesis",
    description: "Extract what matters and the next action fast.",
    placeholder: "Paste an article, memo, transcript, email, or long note dump...",
  },
  {
    type: "App Builder",
    eyebrow: "Build",
    description: "Turn app ideas into flow, MVP, order, and a Codex prompt.",
    placeholder: "Example: an app that helps realtors turn walkthrough notes into listings...",
  },
  {
    type: "Custom",
    eyebrow: "Anything",
    description: "Your instruction, structured and improved by the AI.",
    placeholder: "Paste anything. Add a custom instruction below if you want a specific shape...",
  },
];

export const defaultSignalType: SignalType = "Meeting Notes";

export function getSignal(type: string): SignalDefinition {
  return signals.find((signal) => signal.type === type) ?? signals[0];
}
