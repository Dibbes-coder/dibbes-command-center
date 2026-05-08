import type { QualityBreakdown, RefinementResult } from "./types";

const qualityKeys: Array<keyof QualityBreakdown> = [
  "clarity",
  "originality",
  "emotional_resonance",
  "human_feel",
  "brand_alignment",
  "commercial_usefulness",
  "shareability",
  "visual_potential",
];

export function clampScore(value: unknown): number {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 70;
  return Math.min(100, Math.max(1, Math.round(numberValue)));
}

export function averageQualityScore(breakdown: QualityBreakdown): number {
  const total = qualityKeys.reduce((sum, key) => sum + clampScore(breakdown[key]), 0);
  return Math.round(total / qualityKeys.length);
}

export function normalizeQualityBreakdown(value: unknown): QualityBreakdown {
  const source = isRecord(value) ? value : {};

  return {
    clarity: clampScore(source.clarity),
    originality: clampScore(source.originality),
    emotional_resonance: clampScore(source.emotional_resonance),
    human_feel: clampScore(source.human_feel),
    brand_alignment: clampScore(source.brand_alignment),
    commercial_usefulness: clampScore(source.commercial_usefulness),
    shareability: clampScore(source.shareability),
    visual_potential: clampScore(source.visual_potential),
  };
}

export function normalizeRefinementResult(value: unknown, fallbackInput: string): RefinementResult | null {
  if (!isRecord(value)) return null;

  const quality_breakdown = normalizeQualityBreakdown(value.quality_breakdown);
  const quality_score = averageQualityScore(quality_breakdown);
  const refinedBest = toText(value.refined_best);

  if (!refinedBest) return null;

  return {
    original_input: toText(value.original_input) || fallbackInput,
    refined_best: refinedBest,
    refined_sharp: toText(value.refined_sharp) || refinedBest,
    refined_concise: toText(value.refined_concise) || refinedBest,
    refined_premium: toText(value.refined_premium) || refinedBest,
    refined_human: toText(value.refined_human) || refinedBest,
    hook_options: toTextArray(value.hook_options),
    visual_direction: toText(value.visual_direction),
    image_prompt: toText(value.image_prompt),
    quality_score,
    quality_breakdown,
    why_it_works: toText(value.why_it_works),
    what_changed: toTextArray(value.what_changed),
    next_suggestion: toText(value.next_suggestion),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toTextArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split("\n")
      .map((item) => item.replace(/^[-*•\d.\s]+/, "").trim())
      .filter(Boolean);
  }

  return [];
}
