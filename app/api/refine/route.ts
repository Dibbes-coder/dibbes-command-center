import { NextResponse } from "next/server";
import { generateSignalImage, refineSignal } from "@/lib/openai";
import { defaultBrandDNA, defaultIntents } from "@/lib/storage";
import type { BrandDNA, RefineRequest, RefinementIntent } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RefineRequest>;
    const input = String(body.input ?? "").trim();

    if (!input) {
      return NextResponse.json({ error: "Paste something rough first. SignalForge needs material to refine." }, { status: 400 });
    }

    const payload: RefineRequest = {
      input,
      intents: normalizeIntents(body.intents),
      brandDNA: normalizeBrandDNA(body.brandDNA),
      generateVisual: Boolean(body.generateVisual),
      refineAgain: Boolean(body.refineAgain),
      previousBest: typeof body.previousBest === "string" ? body.previousBest : undefined,
      previousQualityBreakdown: body.previousQualityBreakdown,
    };

    const result = await refineSignal(payload);
    let imageUrl: string | undefined;
    let imageError: string | undefined;

    if (payload.generateVisual && result.image_prompt) {
      try {
        imageUrl = await generateSignalImage(result.image_prompt);
      } catch {
        imageError = "Text refined. Image generation failed — try again.";
      }
    }

    return NextResponse.json({ result, imageUrl, imageError });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signal refinement failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function normalizeIntents(value: unknown): RefinementIntent[] {
  if (!Array.isArray(value)) return defaultIntents;
  const intents = value.filter((intent): intent is RefinementIntent => typeof intent === "string");
  return intents.length ? intents : defaultIntents;
}

function normalizeBrandDNA(value: unknown): BrandDNA {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return defaultBrandDNA;
  }

  const source = value as Partial<Record<keyof BrandDNA, unknown>>;

  return {
    voice: cleanField(source.voice, defaultBrandDNA.voice),
    visualStyle: cleanField(source.visualStyle, defaultBrandDNA.visualStyle),
    audience: cleanField(source.audience, defaultBrandDNA.audience),
    coreValues: cleanField(source.coreValues, defaultBrandDNA.coreValues),
    avoid: cleanField(source.avoid, defaultBrandDNA.avoid),
    signatureColors: cleanField(source.signatureColors, defaultBrandDNA.signatureColors),
    energyLevel: cleanField(source.energyLevel, defaultBrandDNA.energyLevel),
  };
}

function cleanField(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
