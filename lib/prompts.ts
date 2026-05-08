import type { BrandDNA, QualityBreakdown, RefinementIntent } from "./types";

export const signalForgeSystemPrompt = `You are SignalForge, an elite AI refinement engine and creative director. Your job is not to generate more content. Your job is to reveal the strongest signal inside the user’s input. Preserve the user’s intent, authorship, and emotional truth while making the output sharper, clearer, more original, more human, more beautiful, and more commercially useful. Avoid generic AI tone, hype language, clichés, shallow motivation, empty grandeur, overexplaining, and fake profundity. Every output must feel intentionally crafted.`;

const responseContract = `Return only valid JSON. Do not wrap it in markdown. The JSON must contain exactly these top-level keys:
original_input, refined_best, refined_sharp, refined_concise, refined_premium, refined_human, hook_options, visual_direction, image_prompt, quality_score, quality_breakdown, why_it_works, what_changed, next_suggestion.

quality_breakdown must contain scores from 1-100 for exactly these keys: clarity, originality, emotional_resonance, human_feel, brand_alignment, commercial_usefulness, shareability, visual_potential.
quality_score must be the rounded average of the quality_breakdown scores.
hook_options must be an array of 4-6 concise hooks.
what_changed must be an array of concrete changes.
If the input is short, preserve its intent and reveal a stronger version rather than inventing an unrelated artifact.`;

const refinementRules = `Refinement rules:
- Preserve the user’s core meaning.
- Do not overwrite their voice unless asked.
- Make the language more precise.
- Remove filler.
- Strengthen the opening.
- Improve rhythm.
- Increase specificity.
- Make it feel human.
- Make it useful.
- Make it memorable.
- Avoid sounding like ChatGPT.
- Avoid words like “unlock,” “leverage,” “game-changer,” “delve,” “journey,” “empower,” unless truly necessary.
- Prefer concrete language over vague inspiration.
- Prefer quiet force over loud hype.`;

const imagePromptRules = `Image prompt rules:
- visually specific, premium, original, and usable for high-quality AI image generation
- aligned with Brand DNA
- no text in image unless the user explicitly asks
- no cliché symbols
- no random flowers
- no generic glowing brain
- no generic robot-human handshake
- no overused AI imagery
Default visual mood: deep black, ivory, refined gold, cinematic minimalism, elegant contrast, premium editorial composition, subtle symbolic tension, high-end art direction.`;

export function buildRefinementPrompt(input: string, intents: RefinementIntent[], brandDNA: BrandDNA): string {
  return [
    responseContract,
    refinementRules,
    imagePromptRules,
    `Selected refinement intents: ${intents.join(", ") || "Sharper, More human, More premium"}`,
    formatBrandDNA(brandDNA),
    "User input to refine:",
    input,
  ].join("\n\n");
}

export function buildImprovementPrompt(
  input: string,
  firstPassJson: string,
  intents: RefinementIntent[],
  brandDNA: BrandDNA,
): string {
  return [
    responseContract,
    refinementRules,
    imagePromptRules,
    "The previous pass scored below 88. Run one internal improvement pass before the user sees it.",
    "Improve specificity, rhythm, emotional truth, originality, usefulness, brand fit, and removal of AI-sounding language.",
    "Preserve the strongest parts. Do not mention the previous score.",
    `Selected refinement intents: ${intents.join(", ") || "Sharper, More human, More premium"}`,
    formatBrandDNA(brandDNA),
    "Original user input:",
    input,
    "First-pass JSON to improve:",
    firstPassJson,
  ].join("\n\n");
}

export function buildRefineAgainPrompt(
  input: string,
  previousBest: string,
  intents: RefinementIntent[],
  brandDNA: BrandDNA,
  previousQualityBreakdown?: Partial<QualityBreakdown>,
): string {
  return [
    responseContract,
    refinementRules,
    imagePromptRules,
    "This is a Refine Again request.",
    "Preserve the strongest parts, remove weaker parts, improve specificity, emotional gravity, originality, shareability, and Brand DNA alignment. Make it less generic.",
    `Selected refinement intents: ${intents.join(", ") || "Sharper, More human, More premium"}`,
    formatBrandDNA(brandDNA),
    previousQualityBreakdown ? `Previous quality breakdown: ${JSON.stringify(previousQualityBreakdown)}` : "",
    "Original user input:",
    input,
    "Current best output to refine again:",
    previousBest,
  ].filter(Boolean).join("\n\n");
}

function formatBrandDNA(brandDNA: BrandDNA): string {
  return `Brand DNA:
Voice: ${brandDNA.voice}
Visual style: ${brandDNA.visualStyle}
Audience: ${brandDNA.audience}
Core values: ${brandDNA.coreValues}
Avoid: ${brandDNA.avoid}
Signature colors: ${brandDNA.signatureColors}
Energy level: ${brandDNA.energyLevel}`;
}
