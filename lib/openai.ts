import { buildImprovementPrompt, buildRefinementPrompt, buildRefineAgainPrompt, dibbesRefineSystemPrompt } from "./prompts";
import { normalizeRefinementResult } from "./quality";
import type { RefineRequest, RefinementResult } from "./types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

export const DIBBES_REFINE_TEXT_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.1";
export const DIBBES_REFINE_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

const missingKeyMessage = "Missing OPENAI_API_KEY in Vercel environment variables.";

export async function refineSignal(request: RefineRequest): Promise<RefinementResult> {
  assertOpenAIKey();

  const prompt = request.refineAgain && request.previousBest
    ? buildRefineAgainPrompt(
        request.input,
        request.previousBest,
        request.intents,
        request.brandDNA,
        request.previousQualityBreakdown,
      )
    : buildRefinementPrompt(request.input, request.intents, request.brandDNA);

  const firstPassText = await createTextResponse(prompt);
  const firstPass = parseRefinementJson(firstPassText, request.input);

  if (firstPass.quality_score >= 88) {
    return firstPass;
  }

  const improvementPrompt = buildImprovementPrompt(request.input, JSON.stringify(firstPass), request.intents, request.brandDNA);
  const improvedText = await createTextResponse(improvementPrompt);
  return parseRefinementJson(improvedText, request.input);
}

export async function generateSignalImage(prompt: string): Promise<string> {
  assertOpenAIKey();

  const response = await fetch(OPENAI_IMAGES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DIBBES_REFINE_IMAGE_MODEL,
      prompt,
      size: "1024x1024",
      quality: "high",
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "Image generation failed.");
  }

  const data = (await response.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
  const firstImage = data.data?.[0];

  if (firstImage?.b64_json) {
    return `data:image/png;base64,${firstImage.b64_json}`;
  }

  if (firstImage?.url) {
    return firstImage.url;
  }

  throw new Error("Image generation returned no image.");
}

async function createTextResponse(prompt: string): Promise<string> {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DIBBES_REFINE_TEXT_MODEL,
      instructions: dibbesRefineSystemPrompt,
      input: prompt,
      text: {
        format: {
          type: "json_object",
        },
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "OpenAI request failed.");
  }

  const data = (await response.json()) as ResponsesApiResult;
  const text = extractOutputText(data);

  if (!text) {
    throw new Error("OpenAI returned an empty response.");
  }

  return text;
}

function parseRefinementJson(text: string, fallbackInput: string): RefinementResult {
  const parsed = parseJsonObject(text);
  const normalized = normalizeRefinementResult(parsed, fallbackInput);

  if (!normalized) {
    throw new Error("Dibbes Refine received malformed model JSON. Please try again.");
  }

  return normalized;
}

function parseJsonObject(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function assertOpenAIKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(missingKeyMessage);
  }
}

type ResponsesApiResult = {
  output_text?: string;
  output?: Array<{
    content?: Array<{ text?: string; type?: string }>;
  }>;
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
