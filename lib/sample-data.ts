import type { CommandItem } from "./items";

const seededAt = "2026-05-06T12:00:00.000Z";

export const sampleItems: CommandItem[] = [
  {
    id: "sample-command-os",
    title: "Build the personal command OS",
    type: "Project",
    status: "Active",
    energy: "High",
    tags: ["ai", "system", "ops"],
    content: "A single command surface for ideas, prompts, projects, experiments, and shipping decisions.",
    nextAction: "Define the daily review loop and the first Notion sync boundary.",
    createdAt: seededAt,
    updatedAt: seededAt,
  },
  {
    id: "sample-ready-to-ship",
    title: "Launch memo: Signal. Speed. Precision.",
    type: "Note",
    status: "Ready to Ship",
    energy: "Critical",
    tags: ["launch", "copy", "brand"],
    content: "Short premium copy that explains what the command center replaces and why it feels faster.",
    nextAction: "Export the final version and publish it.",
    createdAt: seededAt,
    updatedAt: seededAt,
  },
  {
    id: "sample-raw-signal",
    title: "Raw signal: agent handoff queue",
    type: "Signal",
    status: "Raw",
    energy: "Medium",
    tags: ["agents", "workflow", "research"],
    content: "Every task could carry context, constraints, confidence, and a suggested model handoff path.",
    nextAction: "Convert this into a workflow card.",
    createdAt: seededAt,
    updatedAt: seededAt,
  },
  {
    id: "sample-prompt-lab",
    title: "Prompt Lab: executive synthesis",
    type: "Prompt",
    status: "Active",
    energy: "High",
    tags: ["prompt", "summary", "strategy"],
    content: "Turn messy notes into a decision memo with risks, upside, missing data, and one recommended move.",
    nextAction: "Test with three real note dumps.",
    createdAt: seededAt,
    updatedAt: seededAt,
  },
];
