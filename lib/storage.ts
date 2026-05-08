import type { BrandDNA, RefinementIntent } from "./types";

export const BRAND_DNA_STORAGE_KEY = "dibbes-refine.brandDNA.v1";
export const LAST_INPUT_STORAGE_KEY = "dibbes-refine.lastInput.v1";
export const LAST_OUTPUT_STORAGE_KEY = "dibbes-refine.lastOutput.v1";

export const defaultIntents: RefinementIntent[] = ["Sharper", "More human", "More premium"];

export const intentOptions: RefinementIntent[] = [
  "Sharper",
  "More concise",
  "More premium",
  "More emotional",
  "More viral",
  "More strategic",
  "More visual",
  "More human",
  "More poetic",
  "More commercial",
];

export const defaultBrandDNA: BrandDNA = {
  voice: "concise, sharp, human, emotionally intelligent, quietly bold",
  visualStyle: "deep black, ivory, refined gold, cinematic minimalism, premium sacred-tech",
  audience: "creators, founders, AI-native thinkers, personal brands, high-agency professionals",
  coreValues: "clarity, originality, depth, usefulness, beauty, signal over noise",
  avoid: "generic AI tone, hype, clichés, shallow inspiration, overexplaining, empty grandeur",
  signatureColors: "deep black, ivory, refined gold",
  energyLevel: "still + high voltage",
};

export const exampleInputs = {
  "Rough tweet": "most creators don't need more ideas, they need sharper taste and the courage to delete what is almost good",
  "LinkedIn post": "AI made content easier but also made everything sound the same. The new edge is having a point of view and editing hard.",
  "Product idea": "A tool that helps founders make their messy product messaging sound clearer, more premium, and less like startup jargon.",
  "Image prompt": "a black and gold image about turning noisy thoughts into one clear signal, elegant and cinematic",
  Bio: "I help creators and founders use AI without losing their taste, voice, or originality.",
  "Landing copy": "Our platform helps teams create better content faster with AI-powered workflows and smart tools.",
  "Brand message": "We make AI tools for people who care about quality and don't want generic output.",
  Quote: "The signal was always there. You just had to remove the noise.",
};
