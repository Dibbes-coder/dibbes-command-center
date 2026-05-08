export const SIGNAL_TYPES = [
  "Portrait",
  "X Post",
  "Structured Meeting Notes",
  "Image Prompt",
  "App Idea",
  "Rewrite Sharper",
  "Summary",
  "Custom",
] as const;

export type SignalType = (typeof SIGNAL_TYPES)[number];

export type SignalDefinition = {
  type: SignalType;
  label: string;
  shortLabel: string;
  description: string;
  placeholder: string;
  accent: string;
  outputHint: string;
};

export const SIGNALS: SignalDefinition[] = [
  {
    type: "Portrait",
    label: "Portrait",
    shortLabel: "Portrait",
    description: "Turn a few words into a premium image prompt.",
    placeholder:
      "Describe the subject in a few words. Example: bald man, cinematic black/gold portrait, intense calm.",
    accent: "from-amber-300/30 to-white/5",
    outputHint: "Image prompt",
  },
  {
    type: "X Post",
    label: "X Post",
    shortLabel: "X Post",
    description: "Make a thought sharp enough to post.",
    placeholder: "Paste the idea, emotion, link, or rough thought…",
    accent: "from-sky-300/25 to-white/5",
    outputHint: "Post variants",
  },
  {
    type: "Structured Meeting Notes",
    label: "Structured Meeting Notes",
    shortLabel: "Meeting Notes",
    description: "Clean messy notes into decisions and actions.",
    placeholder: "Paste raw meeting notes, transcript, bullets, or messy thoughts…",
    accent: "from-emerald-300/25 to-white/5",
    outputHint: "Structured notes",
  },
  {
    type: "Image Prompt",
    label: "Image Prompt",
    shortLabel: "Image",
    description: "Upgrade a rough visual idea into a usable prompt.",
    placeholder: "Describe the image you want. Include subject, mood, product, scene, or style if you know it…",
    accent: "from-fuchsia-300/25 to-white/5",
    outputHint: "Prompt + style",
  },
  {
    type: "App Idea",
    label: "App Idea",
    shortLabel: "App Idea",
    description: "Turn a raw product idea into a build plan.",
    placeholder: "Paste the app idea, audience, problem, or rough feature list…",
    accent: "from-indigo-300/25 to-white/5",
    outputHint: "MVP plan",
  },
  {
    type: "Rewrite Sharper",
    label: "Rewrite Sharper",
    shortLabel: "Rewrite",
    description: "Make text clearer, shorter, and stronger.",
    placeholder: "Paste the text you want rewritten…",
    accent: "from-orange-300/25 to-white/5",
    outputHint: "Sharper copy",
  },
  {
    type: "Summary",
    label: "Summary",
    shortLabel: "Summary",
    description: "Extract what matters and the next move.",
    placeholder: "Paste content to summarize: article, notes, transcript, email, or memo…",
    accent: "from-lime-300/25 to-white/5",
    outputHint: "Summary",
  },
  {
    type: "Custom",
    label: "Custom",
    shortLabel: "Custom",
    description: "Give Dibbes a custom instruction.",
    placeholder: "Paste anything. Add a custom instruction below if you want a specific outcome…",
    accent: "from-zinc-200/20 to-white/5",
    outputHint: "Custom output",
  },
];

export function getSignalDefinition(signalType: SignalType): SignalDefinition {
  return SIGNALS.find((signal) => signal.type === signalType) ?? SIGNALS[0];
}

export function isSignalType(value: unknown): value is SignalType {
  return typeof value === "string" && SIGNAL_TYPES.includes(value as SignalType);
}
