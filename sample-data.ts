import type { CommandItem } from "./items";

const now = new Date().toISOString();

export const sampleItems: CommandItem[] = [
  {
    id: "seed-raw-signal",
    title: "We do it our way",
    type: "X Post",
    status: "Ready to Ship",
    energy: 5,
    tags: ["x", "signal", "identity"],
    content: "We do it our way.\n\nSignal. Speed. Precision.",
    nextAction: "Pair with a dark premium visual and publish when timing feels electric.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "seed-prompt-lab",
    title: "Obsidian command center visual",
    type: "Image Prompt",
    status: "Shaping",
    energy: 4,
    tags: ["visual", "premium", "command-center"],
    content: "Ultra-minimal obsidian interface, razor-thin golden signal lines, luminous data cards, deep blue-black depth, personal creative command center, cinematic precision.",
    nextAction: "Generate 3 variants: calmer, sharper, more viral.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "seed-workflow",
    title: "X post from raw thought workflow",
    type: "AI Workflow",
    status: "Raw Signal",
    energy: 4,
    tags: ["workflow", "x", "content"],
    content: "Capture rough thought → extract emotional core → sharpen into one-line post → generate visual prompt → store final asset and performance notes.",
    nextAction: "Turn into reusable prompt template.",
    createdAt: now,
    updatedAt: now
  }
];
