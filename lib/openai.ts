import { getSignalDefinition, isSignalType, type SignalType } from "./signals";

export type ExecuteSignalInput = {
  signalType: SignalType;
  input: string;
  customInstruction?: string;
};

export type ExecuteSignalResult = {
  signalType: SignalType;
  title: string;
  output: string;
  model: string;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.2";

export async function executeSignal({ signalType, input, customInstruction }: ExecuteSignalInput): Promise<ExecuteSignalResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in Vercel environment variables.");
  }

  const signal = getSignalDefinition(signalType);
  const userInput = input.trim() || "The user gave minimal input. Fill in sensible premium defaults.";

  let response: Response;

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        instructions: buildInstructions(signalType, customInstruction),
        input: [
          `Signal: ${signal.label}`,
          `User input:\n${userInput}`,
          customInstruction?.trim() ? `Custom instruction:\n${customInstruction.trim()}` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
        max_output_tokens: 1200,
      }),
    });
  } catch {
    throw new Error("OpenAI request failed. Check network access and Vercel environment variables, then try again.");
  }

  let payload: OpenAIResponse;

  try {
    payload = (await response.json()) as OpenAIResponse;
  } catch {
    throw new Error("OpenAI returned an unreadable response. Try again.");
  }

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "OpenAI execution failed. Try again.");
  }

  return {
    signalType,
    title: signal.label,
    output: extractOutputText(payload),
    model: DEFAULT_MODEL,
  };
}

export function parseSignalType(value: unknown): SignalType {
  return isSignalType(value) ? value : "Custom";
}

function buildInstructions(signalType: SignalType, customInstruction?: string): string {
  const base = [
    "You are Dibbes Command Center: a fast AI execution cockpit.",
    "The user should not need to understand prompts, models, or parameters.",
    "Fill in missing details intelligently, but never invent hard facts, names, dates, or owners.",
    "Be premium, direct, useful, and non-generic.",
    "Return clean formatted text. No markdown fences. No preamble.",
  ];

  if (signalType === "Portrait") {
    return [
      ...base,
      "Create a complete premium image prompt from minimal input.",
      "Style: cinematic, emotionally intelligent, premium, sharp, modern, not generic, suitable for OpenAI image generation.",
      "Return exactly these sections: Suggested title, Final image prompt, Creative rationale.",
    ].join("\n");
  }

  if (signalType === "Structured Meeting Notes") {
    return [
      ...base,
      "Turn messy pasted content into structured meeting notes.",
      "Return sections: Executive summary, Key decisions, Action items with owners if mentioned, Open questions, Risks/blockers, Follow-up message draft.",
      "If owners or dates are missing, write 'not specified'. Never invent hard facts.",
    ].join("\n");
  }

  if (signalType === "X Post") {
    return [
      ...base,
      "Turn the rough thought into high-signal X content.",
      "Return sections: Strong short X post, Bolder version, Calmer premium version, Optional image prompt.",
      "Keep it sharp, concise, and non-generic.",
    ].join("\n");
  }

  if (signalType === "Image Prompt") {
    return [
      ...base,
      "Turn the rough visual idea into a polished image prompt.",
      "Return sections: Polished image prompt, Aspect ratio suggestion, Style notes, Negative prompt / avoid list.",
    ].join("\n");
  }

  if (signalType === "App Idea") {
    return [
      ...base,
      "Turn the raw app idea into a practical build plan.",
      "Return sections: One-sentence concept, Core user flow, MVP features, What to build first, Codex-ready implementation prompt.",
    ].join("\n");
  }

  if (signalType === "Rewrite Sharper") {
    return [
      ...base,
      "Rewrite the pasted text to be clearer, shorter, more elegant, and stronger.",
      "Return only improved versions. No lecture. Use sections: Clean version, Sharper version, Premium version.",
    ].join("\n");
  }

  if (signalType === "Summary") {
    return [
      ...base,
      "Summarize the pasted content.",
      "Return sections: Short summary, Key points, What matters, Next action.",
    ].join("\n");
  }

  return [
    ...base,
    customInstruction?.trim()
      ? `Follow this custom instruction: ${customInstruction.trim()}`
      : "No custom instruction was provided. Intelligently improve, structure, and make the input useful.",
  ].join("\n");
}

function extractOutputText(payload: OpenAIResponse): string {
  if (payload.output_text?.trim()) return payload.output_text.trim();

  const text = payload.output
    ?.flatMap((entry) => entry.content ?? [])
    .map((content) => content.text ?? "")
    .join("\n")
    .trim();

  return text || "OpenAI returned an empty result. Try adding more input and rerun.";
}
