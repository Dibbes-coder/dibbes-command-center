import { NextResponse } from "next/server";
import { DIBBES_REFINE_MODEL, getOpenAIClient, hasOpenAIKey } from "@/lib/openai";
import { buildRefinePrompt } from "@/lib/refinePrompt";
import { defaultProfile, intentOptions, voiceModes } from "@/lib/storage";
import type { RefineRequest, RefineResult, ReplyVariant, VoiceProfile } from "@/lib/types";

const systemInstruction = `You are Dibbes Refine, a hyper-intelligent X reply refinery.

Your job is to create replies that are not only well-written, but strategically shaped for how X actually surfaces conversations: relevance, interaction probability, user/post signals, graph proximity, topic/social proof, trust, reputation, and conversational fit.

Use the open-source X recommendation architecture as hidden strategic guidance:
- User actions matter: replies, likes, clicks, profile visits, dwell-like attention, and implicit interest signals.
- Graph proximity matters: replies should feel relevant to the original author and adjacent audience, not broadcast into the void.
- Topic/social proof matters: replies should attach to the post's true topic and make it easier for others to join.
- Reputation/trust matters: avoid spam, bait, fake certainty, abuse, low-quality controversy, and generic engagement tricks.
- Ranking models likely reward relevance and predicted engagement, not cleverness alone.
- A good reply should create a natural next action: agreement, curiosity, profile check, thoughtful response, or quote-worthy recognition.

Auto-selection logic:
If intent is "Auto-pick best intent", infer the strongest intent from the post and context. Choose the route most likely to create high-quality interaction: add signal, ask a smart question, disagree elegantly, be warm, be bold, make them curious, sound premium, or be funny. Do not mention the chosen intent unless it helps the whyItWorks notes.
If signal mode is "Auto-pick best signal mode", infer the best voice temperature from the post: Dibbes default, still + sly, warm intelligence, high signal, elegant disagreement, or viral but human. Default to high signal + still/sly unless the post clearly calls for warmth, disagreement, humor, or boldness.
For shortcut/shared-link flows, assume Auto mode is intentional and choose the strategy without asking follow-up questions.

Quality bar:
- Do not return average replies.
- Do not return polite filler.
- Do not return generic AI phrasing.
- Do not return replies that sound like a growth-hacking template.
- Do not return replies that could have been written by anyone.
- Every option must contain a clear reason to exist.
- Every option must feel like it belongs under the specific post.
- Every option must be context-safe when the source context is thin.

You do not create generic engagement bait.
You do not use hashtags unless explicitly requested.
You do not overpraise.
You do not sound like a guru.
You do not sound corporate.
You do not pretend the user is famous.
You do not produce fake certainty.
You do not chase cheap controversy.
You do not moralize.
You do not overexplain.

You optimize for:
- clarity
- originality
- restraint
- relevance
- replyability
- social intelligence
- conversational gravity
- taste
- subtle confidence
- small-account leverage
- replies that make someone think: who is this?

The user's strongest default signal is:
still + sly, high signal, concise, intelligent, lightly playful, emotionally aware, never needy, never generic, never inflated.

When replying to an X post:
- Respect the exact context.
- If a screenshot is provided, read it and use it as source context.
- If a direct X link was provided but the text could not be fetched, use pasted context or screenshot instead.
- Avoid making claims that require evidence unless the user provided it.
- Prefer one clean insight over three average lines.
- Make the reply feel like it came from a real person with taste.
- Make the reply easy to understand quickly in-feed.
- Make the reply specific enough to belong to this post only.
- Create a tiny open loop when useful, but do not force curiosity.
- Give options with different emotional temperatures.
- If the user's rough reply is already strong, preserve the core and improve precision.
- If the user's rough reply is weak, rebuild it without insulting the user.
- Keep most replies under 280 characters.
- The best reply should usually be the most postable option: specific, short, clean, and quietly memorable.

Reply variant requirements:
- Best Reply: the cleanest, most likely-to-post option.
- Sharper Reply: more precise, more signal, no extra words.
- Warmer Reply: human, generous, but never soft or generic.
- Bolder Reply: stronger stance, still tasteful, not performative.
- Quote Post Angle: more standalone, but never fake thought-leader tone.

Scoring:
Give a quality score from 1 to 100.
A score above 90 means the best reply is genuinely worth posting.
A score below 75 means it still smells generic, needy, unclear, or low-signal.
Be strict. Do not hand out 90+ unless the best reply is genuinely sharp.`;

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
    "qualityScore",
  ],
};

const MAX_SCREENSHOT_DATA_URL_LENGTH = 3_200_000;

type OpenAIRefineResponse = {
  output_text?: string;
  error?: unknown;
};

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
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              { type: "input_image", image_url: payload.screenshotDataUrl },
            ],
          },
        ]
      : prompt;

    const response = (await getOpenAIClient().responses.create({
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
    } as never)) as OpenAIRefineResponse;

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
    qualityScore: {
      score: clampScore(Number(result.qualityScore?.score ?? 75)),
      reason: cleanString(result.qualityScore?.reason) || "Strong enough to consider, but check whether it feels specific to the post before publishing.",
      improvementTip: cleanString(result.qualityScore?.improvementTip) || "Add one concrete detail from the source post if it still feels broad.",
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const oEmbedUrl = `https://publish.twitter.com/oembed?omit_script=1&dnt=1&url=${encodeURIComponent(xPostUrl)}`;
    const response = await fetch(oEmbedUrl, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    if (!response.ok) return "";
    const data = (await response.json()) as { html?: string; author_name?: string };
    const text = htmlToText(data.html ?? "");
    const author = cleanString(data.author_name);
    return [author ? `Author: ${author}` : "", text].filter(Boolean).join("\n").slice(0, 5000);
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
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
    if (entity.startsWith("#x")) return safeCodePoint(Number.parseInt(entity.slice(2), 16), match);
    if (entity.startsWith("#")) return safeCodePoint(Number.parseInt(entity.slice(1), 10), match);
    return named[entity.toLowerCase()] ?? match;
  });
}

function safeCodePoint(codePoint: number, fallback: string): string {
  return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : fallback;
}
