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

The user's strongest default signal is:
still + sly, high signal, concise, intelligent, lightly playful, emotionally aware, and never needy.

When replying to an X post:
- Respect the context.
- If a screenshot is provided, read it and use it as source context.
- If a direct X link was provided but the text could not be fetched, use pasted context or screenshot instead.
- Avoid making claims that require evidence unless the user provided it.
- Prefer one clean insight over three average lines.
- Make the reply feel like it came from a real person with taste.
- Give options with different emotional temperatures.
- If the user's rough reply is already strong, preserve the core and improve precision.
- If the user's rough reply is weak, rebuild it without insulting the user.
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

const MAX_SCREENSHOT_DATA_URL_LENGTH = 3_200_000;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RefineRequest>;
    const payload = normalizeRequest(body);

    if (!payload.postContext && !payload.xPostUrl && !payload.screenshotDataUrl) {
      return NextResponse.json(
        { error: "Paste copy, add an X link, or upload a screenshot first." },
        { status: 400 },
      );
    }

    if (payload.screenshotDataUrl && !isSupportedScreenshot(payload.screenshotDataUrl)) {
      return NextResponse.json(
        { error: "Screenshot is too large or unsupported. Use a smaller PNG, JPG, or WEBP image." },
        { status: 400 },
      );
    }

    if (!hasOpenAIKey()) {
      return NextResponse.json(
        { error: "OpenAI is not configured yet. Add OPENAI_API_KEY to the server environment." },
        { status: 500 },
      );
    }

    const fetchedPostText = payload.xPostUrl ? await fetchXPostText(payload.xPostUrl) : "";
    const prompt = buildRefinePrompt(payload, fetchedPostText);
    const input = payload.screenshotDataUrl
      ? [
          {
            role: "user" as const,
            content: [
              { type: "input_text" as const, text: prompt },
              { type: "input_image" as const, image_url: payload.screenshotDataUrl },
            ],
          },
        ]
      : prompt;

    const response = await getOpenAIClient().responses.create({
      model: DIBBES_REFINE_MODEL,
      instructions: systemInstruction,
      input,
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
    xPostUrl: normalizeXUrl(body.xPostUrl),
    screenshotDataUrl: cleanString(body.screenshotDataUrl),
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
    dontPostIf: cleanString(result.dontPostIf) || "Don't post if the context has shifted, the post is bait, or the reply would pull you into low-signal drama.",
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

function normalizeXUrl(value: unknown): string {
  const raw = cleanString(value);
  if (!raw) return "";

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, "").replace(/^mobile\./, "");
    if (host !== "x.com" && host !== "twitter.com") return "";
    if (!/\/status(es)?\/\d+/.test(url.pathname)) return "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function isSupportedScreenshot(dataUrl: string): boolean {
  if (dataUrl.length > MAX_SCREENSHOT_DATA_URL_LENGTH) return false;
  return /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(dataUrl);
}

async function fetchXPostText(xPostUrl: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    const oEmbedUrl = `https://publish.twitter.com/oembed?omit_script=1&dnt=1&url=${encodeURIComponent(xPostUrl)}`;
    const response = await fetch(oEmbedUrl, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeout);

    if (!response.ok) return "";
    const data = (await response.json()) as { html?: string; author_name?: string };
    const text = htmlToText(data.html ?? "");
    const author = cleanString(data.author_name);
    return [author ? `Author: ${author}` : "", text].filter(Boolean).join("\n").slice(0, 5000);
  } catch {
    return "";
  }
}

function htmlToText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+\n/g, "\n")
      .replace(/\n\s+/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim(),
  );
}

function decodeHtmlEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  };

  return value.replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return named[entity.toLowerCase()] ?? match;
  });
}
