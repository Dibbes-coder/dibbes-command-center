export type RefinementIntent =
  | "Sharper"
  | "More concise"
  | "More premium"
  | "More emotional"
  | "More viral"
  | "More strategic"
  | "More visual"
  | "More human"
  | "More poetic"
  | "More commercial";

export type BrandDNA = {
  voice: string;
  visualStyle: string;
  audience: string;
  coreValues: string;
  avoid: string;
  signatureColors: string;
  energyLevel: string;
};

export type QualityBreakdown = {
  clarity: number;
  originality: number;
  emotional_resonance: number;
  human_feel: number;
  brand_alignment: number;
  commercial_usefulness: number;
  shareability: number;
  visual_potential: number;
};

export type RefinementResult = {
  original_input: string;
  refined_best: string;
  refined_sharp: string;
  refined_concise: string;
  refined_premium: string;
  refined_human: string;
  hook_options: string[];
  visual_direction: string;
  image_prompt: string;
  quality_score: number;
  quality_breakdown: QualityBreakdown;
  why_it_works: string;
  what_changed: string[];
  next_suggestion: string;
};

export type RefineRequest = {
  input: string;
  intents: RefinementIntent[];
  brandDNA: BrandDNA;
  generateVisual?: boolean;
  refineAgain?: boolean;
  previousBest?: string;
  previousQualityBreakdown?: Partial<QualityBreakdown>;
};

export type RefineResponse = {
  result?: RefinementResult;
  imageUrl?: string;
  imageError?: string;
  error?: string;
};

export type ImageRequest = {
  prompt: string;
};

export type ImageResponse = {
  imageUrl?: string;
  error?: string;
};

export type SignalType =
  | "Portrait"
  | "Image Prompt"
  | "X Post"
  | "Meeting Notes"
  | "Rewrite"
  | "Summary"
  | "App Builder"
  | "Custom";

export type SignalDefinition = {
  type: SignalType;
  eyebrow: string;
  description: string;
  placeholder: string;
};

export type SavedResult = {
  id: string;
  signalType: SignalType | string;
  input: string;
  output: string;
  createdAt: string;
};
