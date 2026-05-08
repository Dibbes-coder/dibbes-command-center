import type { ExecuteRequest } from "./types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
export const SIGNALFORGE_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.1";

const missingKeyMessage = "Missing OPENAI_API_KEY in Vercel environment variables.";

export async function executeSignal({ signalType, input, customInstruction }: ExecuteRequest): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return missingKeyMessage;
  }

  const cleanInput = input.trim();
  const cleanCustomInstruction = customInstruction?.trim();

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: SIGNALFORGE_MODEL,
      instructions: [
        "You are SignalForge, a fast AI execution engine.",
        "Fill in missing details intelligently without sounding generic.",
        "Return immediately useful output only. No preamble. No long explanation.",
        "Use crisp labels, bullets, and compact sections.",
        "If the user's input is sparse, make tasteful premium assumptions and keep moving.",
      ].join("\n"),
      input: buildSignalPrompt(signalType, cleanInput, cleanCustomInstruction),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "OpenAI request failed.");
  }

  const data = (await response.json()) as ResponsesApiResult;
  return extractOutputText(data) || "No output returned.";
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
