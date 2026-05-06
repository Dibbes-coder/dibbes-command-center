import type { CommandItem } from "./items";

const seededAt = "2026-05-06T12:00:00.000Z";

export const sampleItems: CommandItem[] = [
  {
    id: "sample-x-post",
    title: "X post: Signal. Speed. Precision.",
    type: "X Post",
    status: "Ready to Ship",
    energy: "Critical",
    tags: ["launch", "copy", "brand"],
    content:
      "The best personal AI system is not another inbox. It is a command center: capture the signal, refine the move, execute fast, and keep the loop clean.",
    nextAction: "Copy the post and publish it on X.",
    executionNotes: "",
    createdAt: seededAt,
    updatedAt: seededAt,
  },
  {
    id: "sample-image-prompt",
    title: "Image prompt: premium command room",
    type: "Image Prompt",
    status: "Refining",
    energy: "High",
    tags: ["image", "visual", "dashboard"],
    content:
      "A dark premium personal AI dashboard in a cinematic command room, amber highlights, glass panels, minimal interface, high contrast, precise details.",
    nextAction: "Copy the prompt into an image model and test three variations.",
    executionNotes: "",
    createdAt: seededAt,
    updatedAt: seededAt,
  },
  {
    id: "sample-workflow",
    title: "AI workflow: turn notes into decision memo",
    type: "AI Workflow",
    status: "Ready to Ship",
    energy: "High",
    tags: ["prompt", "summary", "strategy"],
    content:
      "Convert messy notes into a decision memo with context, decision needed, options, risks, upside, missing information, and one recommended next move.",
    nextAction: "Copy the workflow and run it against a real notes dump.",
    executionNotes: "",
    createdAt: seededAt,
    updatedAt: seededAt,
  },
  {
    id: "sample-project",
    title: "Project: personal command OS",
    type: "Project",
    status: "Raw",
    energy: "Medium",
    tags: ["ai", "system", "ops"],
    content:
      "A single command surface for ideas, prompts, projects, experiments, and shipping decisions.",
    nextAction: "Define the daily review loop and decide what gets archived each Friday.",
    executionNotes: "",
    createdAt: seededAt,
    updatedAt: seededAt,
  },
];
