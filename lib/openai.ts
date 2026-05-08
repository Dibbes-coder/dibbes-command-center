import { buildSystemInstruction, PORTRAIT_QUALITY_STANDARD, VISUAL_QUALITY_STANDARD } from "./quality";
import type { ExecuteRequest, ExecutionResult } from "./types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

export const SIGNALFORGE_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.1";
export const SIGNALFORGE_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

const missingKeyMessage = "Missing OPENAI_API_KEY in Vercel environment variables.";
const imageFailureMessage = "Image generation failed, but your prompt was created successfully.";

export async function executeSignal({
  signalType,
  input,
  customInstruction,
  generateImage,
  portraitPreset,
}: ExecuteRequest): Promise<ExecutionResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      kind: isVisualSignal(signalType) ? "image" : "text",
      signalType,
      output: missingKeyMessage,
      imageError: isVisualSignal(signalType) ? missingKeyMessage : undefined,
    };
  }

  if (signalType === "Portrait" || signalType === "Image Prompt") {
    return executeVisualSignal({ signalType, input, generateImage, portraitPreset });
  }

  const output = await generateTextOutput(signalType, input.trim(), customInstruction?.trim());

  return {
    kind: "text",
    signalType,
    output,
  };
}

async function executeVisualSignal({
  signalType,
  input,
  generateImage,
  portraitPreset,
}: Pick<ExecuteRequest, "signalType" | "input" | "generateImage" | "portraitPreset">): Promise<ExecutionResult> {
  const visual = await generateVisualBrief(signalType, input.trim(), portraitPreset?.trim());
  const shouldGenerateImage = signalType === "Portrait" || Boolean(generateImage);
  const baseResult: ExecutionResult = {
    kind: "image",
    signalType,
    title: visual.title,
    promptUsed: visual.prompt,
    rationale: visual.rationale,
    output: formatVisualOutput(visual),
  };

  if (!shouldGenerateImage) {
    return baseResult;
  }

  try {
    const imageDataUrl = await generateOpenAIImage(visual.prompt);

    return {
      ...baseResult,
      imageDataUrl,
      imageStored: true,
    };
  } catch (error) {
    return {
      ...baseResult,
      imageError: readableOpenAIError(error, imageFailureMessage),
    };
  }
}

async function generateTextOutput(signalType: string, input: string, customInstruction?: string): Promise<string> {
  const response = await callResponses({
    instructions: buildSystemInstruction(),
    input: buildSignalPrompt(signalType, input, customInstruction),
  });

  return extractOutputText(response) || "No output returned.";
}

async function generateVisualBrief(signalType: string, input: string, portraitPreset?: string): Promise<VisualBrief> {
  const response = await callResponses({
    instructions: buildSystemInstruction([VISUAL_QUALITY_STANDARD, signalType === "Portrait" ? PORTRAIT_QUALITY_STANDARD : ""].filter(Boolean).join("\n\n")),
    input: buildVisualPrompt(signalType, input, portraitPreset),
  });
  const text = extractOutputText(response);
  const parsed = parseVisualBrief(text);

  if (parsed) {
    return parsed;
  }

  return {
    title: signalType === "Portrait" ? "Premium Campaign Portrait" : "Polished Image Direction",
    prompt: text || input || "A tasteful premium visual with clear composition and realistic materials.",
    rationale: "The direction was structured for a clear, usable visual result with premium restraint.",
  };
}

async function generateOpenAIImage(prompt: string): Promise<string> {
  const response = await fetch(OPENAI_IMAGES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: SIGNALFORGE_IMAGE_MODEL,
      prompt,
      size: "1024x1536",
      quality: "high",
      n: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = (await response.json()) as ImagesApiResult;
  const base64 = data.data?.[0]?.b64_json;

  if (!base64) {
    throw new Error("The image API did not return image data.");
  }

  return `data:image/png;base64,${base64}`;
}

async function callResponses({ instructions, input }: { instructions: string; input: string }): Promise<ResponsesApiResult> {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: SIGNALFORGE_MODEL,
      instructions,
      input,
    }),
  });

  if (!response.ok) {
    throw new Error(readableOpenAIError(await response.text(), "OpenAI request failed."));
  }

  return (await response.json()) as ResponsesApiResult;
}

type VisualBrief = {
  title: string;
  prompt: string;
  rationale: string;
};

type ResponsesApiResult = {
  output_text?: string;
  output?: Array<{
    content?: Array<{ text?: string; type?: string }>;
  }>;
};

type ImagesApiResult = {
  data?: Array<{ b64_json?: string; url?: string }>;
};

function extractOutputText(data: ResponsesApiResult): string {
  if (data.output_text?.trim()) {
    return data.output_text.trim();
  }

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter((text): text is string => Boolean(text?.trim()))
      .join("\n")
      .trim() ?? ""
  );
}

function buildSignalPrompt(signalType: string, input: string, customInstruction?: string): string {
  const instruction = signalInstructions[signalType] ?? signalInstructions.Custom;
  const custom = customInstruction ? `\nCustom instruction:\n${customInstruction}\n` : "";

  return [
    `Signal type: ${signalType}`,
    instruction,
    custom,
    "Raw input:",
    input || "No raw input provided. Infer a useful starting point from the selected signal.",
  ].join("\n\n");
}

function buildVisualPrompt(signalType: string, input: string, portraitPreset?: string): string {
  if (signalType === "Portrait") {
    return [
      "Create a premium Portrait image brief as strict JSON with keys: title, prompt, rationale.",
      portraitPreset ? `Portrait preset: ${portraitPreset}` : "Portrait preset: choose the best premium direction from the input.",
      "The prompt must specify 4:5 vertical, premium app campaign portrait, cinematic founder energy, human-first technology, warm trust, expressive eyes, commercial polish, real skin texture, elegant phone/app integration, and subtle atmospheric UI elements when appropriate.",
      "The generated image must not contain fake logos, unreadable text, plastic skin, clutter, overprocessed HDR, or generic stock-photo energy.",
      "Return JSON only. No markdown.",
      "Raw input:",
      input || "A founder building a premium AI product for everyday people.",
    ].join("\n\n");
  }

  return [
    "Create a polished Image Prompt brief as strict JSON with keys: title, prompt, rationale.",
    "The prompt must include subject, composition, lighting, material detail, mood, lens/camera feel when useful, aspect ratio, and a concise avoid list inside the prompt.",
    "Return JSON only. No markdown.",
    "Raw input:",
    input || "A premium visual concept with strong composition and clear lighting.",
  ].join("\n\n");
}

function parseVisualBrief(value: string): VisualBrief | null {
  const json = extractJson(value);

  if (!json) return null;

  try {
    const parsed = JSON.parse(json) as Partial<VisualBrief>;
    if (parsed.prompt?.trim()) {
      return {
        title: parsed.title?.trim() || "SignalForge Visual",
        prompt: parsed.prompt.trim(),
        rationale: parsed.rationale?.trim() || "Built for a polished, usable visual result.",
      };
    }
  } catch {
    return null;
  }

  return null;
}

function extractJson(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) return null;
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  if (fenced?.startsWith("{") && fenced.endsWith("}")) return fenced;

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return null;
}

function formatVisualOutput(visual: VisualBrief): string {
  return [`Title\n${visual.title}`, `Final prompt\n${visual.prompt}`, `Creative rationale\n${visual.rationale}`].join("\n\n");
}

function isVisualSignal(signalType: string): boolean {
  return signalType === "Portrait" || signalType === "Image Prompt";
}

function readableOpenAIError(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : String(error || "");
  const lower = raw.toLowerCase();

  if (lower.includes("rate_limit") || lower.includes("rate limit") || lower.includes("429")) {
    return `${fallback} OpenAI rate limit reached. Try again in a moment.`;
  }

  if (lower.includes("billing") || lower.includes("quota") || lower.includes("insufficient_quota")) {
    return `${fallback} Check OpenAI billing or project quota.`;
  }

  if (lower.includes("api key") || lower.includes("unauthorized") || lower.includes("401")) {
    return `${fallback} Check the OPENAI_API_KEY value in Vercel.`;
  }

  return fallback;
}

const signalInstructions: Record<string, string> = {
  Portrait: "Turn minimal input into a premium image prompt. Return exactly: Title, Final image prompt, Creative rationale, Style notes.",
  "Image Prompt": "Turn the rough visual idea into exactly: Polished prompt, Aspect ratio, Lighting, Composition, Avoid list.",
  "X Post": "Return exactly: Best short post, Bolder version, Calmer premium version, Optional image idea.",
  "Meeting Notes": "Turn messy notes into exactly: Executive summary, Key decisions, Action items, Open questions, Risks, Follow-up message.",
  Rewrite: "Make the text sharper, shorter, clearer. Return exactly three versions: Clean, Stronger, Ultra-short.",
  Summary: "Return exactly: Short summary, Key points, What matters, Next action.",
  "App Builder": "Turn the idea into exactly: Concept, User flow, MVP features, Build order, Codex-ready prompt.",
  Custom: "Use the customInstruction if provided. Otherwise intelligently structure and improve the input into a useful final artifact with concise headings.",
};
