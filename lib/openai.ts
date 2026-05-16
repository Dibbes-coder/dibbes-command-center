import OpenAI from "openai";

export const DIBBES_REFINE_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.5";

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
