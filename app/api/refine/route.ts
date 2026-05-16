import { NextResponse } from "next/server";
import { DIBBES_REFINE_MODEL, getOpenAIClient, hasOpenAIKey } from "@/lib/openai";
import { buildRefinePrompt } from "@/lib/refinePrompt";
import { defaultProfile, intentOptions, voiceModes } from "@/lib/storage";
import type { RefineRequest, RefineResult, ReplyVariant, VoiceProfile } from "@/lib/types";

const systemInstruction = `You are Dibbes Refine, a high-signal X reply strategist.

Your job is to help the user write replies on X that feel human, sharp, original, and worth noticing.

You do not create generic engagement bait.
You do not use hashtags unless explicitly requested.
You do not overpraise.
You do not sound like a guru.
You do not sound corporate.
You do not pretend the user is famous.
You do not produce fake certainty.
You do not chase cheap controversy.

You optimize for:
- clarity
- originality
- social intelligence
- timing
- taste
- subtle confidence
- conversational gravity
- small-account leverage

The user’s strongest default voice is:
still + sly, high signal, concise, intelligent, lightly playful, emotionally aware, and never needy.

When replying to an X post:
- Respect the context.
- Avoid making claims that require evidence unless the user provided it.
- Prefer one clean insight over three average lines.
- Make the reply feel like it came from a real person with taste.
- Give options with different emotional temperatures.
- If the user’s rough reply is already strong, preserve the core and improve precision.
- If the user’s rough reply is weak, rebuild it without insulting the user.
- If the post is bait, low-quality, toxic, or not worth replying to, say so in the warning.
- Keep most replies under 280 characters unless a quote-post angle needs more room.

Scoring:
Give a quality score from 1 to 100.
A score above 90 means the reply is worth posting.
A score below 75 means it still smells generic, needy, unclear, or low-signal.`;

const replyVariantSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    text: { type: "string" },
    whyItWorks: { type: "string" },
    characterCount: { type: "number" },
  },
  required: ["text", "whyItWorks", "characterCount"],
};

const refineSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    bestReply: replyVariantSchema,
    sharperReply: replyVariantSchema,
    warmerReply: replyVariantSchema,
    bolderReply: replyVariantSchema,
    quotePostAngle: replyVariantSchema,
    dontPostIf: { type: "string" },
    qualityScore: {
      type: "object",
      additionalProperties: false,
      properties: {
        score: { type: "number" },
        reason: { type: "string" },
        improvementTip: { type: "string" },
      },
      required: ["score", "reason", "improvementTip"],
    },
  },
  required: [
    "bestReply",
    "sharperReply",
    "warmerReply",
    "bolderReply",
    "quotePostAngle",
    "dontPostIf",
    "qualityScore",
  ],
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RefineRequest>;
    const payload = normalizeRequest(body);

    if (!payload.postContext) {
      return NextResponse.json(
        { error: "Paste the X post you want to reply to first." },
        { status: 400 },
      );
    }

    if (!hasOpenAIKey()) {
      return NextResponse.json(
        { error: "OpenAI is not configured yet. Add OPENAI_API_KEY to the server environment." },
        { status: 500 },
      );
    }

    const response = await getOpenAIClient().responses.create({
      model: DIBBES_REFINE_MODEL,
      instructions: systemInstruction,
      input: buildRefinePrompt(payload),
      max_output_tokens: 1800,
      text: {
        format: {
          type: "json_schema",
          name: "dibbes_refine_result",
          strict: true,
          schema: refineSchema,
        },
      },
    });

    if (response.error) {
      throw new Error("Model response failed.");
    }

    const outputText = response.output_text;
    if (!outputText) {
      throw new Error("Empty model response.");
    }

    const result = normalizeResult(JSON.parse(outputText) as RefineResult);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Refine API error", error);
    return NextResponse.json(
      { error: "Dibbes Refine could not sharpen this reply. Please try again in a moment." },
      { status: 500 },
    );
  }
}

function normalizeRequest(body: Partial<RefineRequest>): RefineRequest {
  return {
    postContext: cleanString(body.postContext),
    roughReply: cleanString(body.roughReply),
    intent: intentOptions.includes(body.intent as never) ? String(body.intent) : intentOptions[0],
    voiceMode: voiceModes.includes(body.voiceMode as never) ? String(body.voiceMode) : voiceModes[0],
    profile: normalizeProfile(body.profile),
  };
}

function normalizeProfile(profile: unknown): VoiceProfile {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) return defaultProfile;
  const source = profile as Partial<Record<keyof VoiceProfile, unknown>>;

  return {
    handle: cleanString(source.handle) || defaultProfile.handle,
    coreTone: cleanString(source.coreTone) || defaultProfile.coreTone,
    avoid: cleanString(source.avoid) || defaultProfile.avoid,
    signaturePhrases: cleanString(source.signaturePhrases) || defaultProfile.signaturePhrases,
    preferredLength: cleanString(source.preferredLength) || defaultProfile.preferredLength,
    personalStance: cleanString(source.personalStance) || defaultProfile.personalStance,
  };
}

function normalizeResult(result: RefineResult): RefineResult {
  return {
    bestReply: normalizeReply(result.bestReply),
    sharperReply: normalizeReply(result.sharperReply),
    warmerReply: normalizeReply(result.warmerReply),
    bolderReply: normalizeReply(result.bolderReply),
    quotePostAngle: normalizeReply(result.quotePostAngle),
    dontPostIf: cleanString(result.dontPostIf) || "Don’t post if the context has shifted, the post is bait, or the reply would pull you into low-signal drama.",
    qualityScore: {
      score: clampScore(Number(result.qualityScore?.score ?? 75)),
      reason: cleanString(result.qualityScore?.reason) || "Clear enough to consider, but review for context before posting.",
      improvementTip: cleanString(result.qualityScore?.improvementTip) || "Add one more specific detail from the original post if it feels too broad.",
    },
  };
}

function normalizeReply(reply: ReplyVariant): ReplyVariant {
  const text = cleanString(reply?.text);
  return {
    text,
    whyItWorks: cleanString(reply?.whyItWorks) || "It keeps the reply specific, human, and easy to read.",
    characterCount: text.length,
  };
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 75;
  return Math.min(100, Math.max(1, Math.round(score)));
}
