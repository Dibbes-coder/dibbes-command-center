import { NextResponse } from "next/server";
import { normalizeItem, type CommandItem } from "@/lib/items";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ExecuteRequest = {
  item?: unknown;
  mode?: string;
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

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.2";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "OpenAI execution is not configured. Add OPENAI_API_KEY in Vercel or .env.local.",
      },
      { status: 503 },
    );
  }

  let body: ExecuteRequest;

  try {
    body = (await request.json()) as ExecuteRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const item = normalizeItem(body.item);

  if (!item) {
    return NextResponse.json({ ok: false, error: "A valid command item is required." }, { status: 400 });
  }

  const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: buildInstructions(item),
      input: buildInput(item, body.mode),
      max_output_tokens: 900,
    }),
  });

  const payload = (await openAIResponse.json()) as OpenAIResponse;

  if (!openAIResponse.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: payload.error?.message ?? "OpenAI execution failed.",
      },
      { status: openAIResponse.status },
    );
  }

  const text = extractOutputText(payload);

  return NextResponse.json({ ok: true, model: OPENAI_MODEL, text });
}

function buildInstructions(item: CommandItem): string {
  const base = [
    "You are the execution layer for Dibbes Command Center.",
    "Tone: premium, minimal, direct. Motto: Signal. Speed. Precision.",
    "Return only the useful execution output. Do not include preambles or markdown fences.",
  ];

  if (item.type === "X Post") {
    return [...base, "Create a polished copy-ready X post. Keep it concise, sharp, and publishable."].join("\n");
  }

  if (item.type === "Image Prompt") {
    return [...base, "Create a vivid image-generation prompt with subject, style, composition, lighting, details, and avoid-list."].join("\n");
  }

  if (item.type === "Prompt" || item.type === "AI Workflow") {
    return [...base, "Create a copy-ready prompt or AI workflow that another model can follow immediately."].join("\n");
  }

  return [...base, "Create a practical execution checklist with 5-7 concrete steps."].join("\n");
}

function buildInput(item: CommandItem, mode?: string): string {
  return [
    `Execution mode: ${mode ?? "execute"}`,
    `Title: ${item.title}`,
    `Type: ${item.type}`,
    `Status: ${item.status}`,
    `Energy: ${item.energy}`,
    `Tags: ${item.tags.join(", ") || "none"}`,
    `Content:\n${item.content || "No content provided."}`,
    `Next action:\n${item.nextAction || "No next action provided."}`,
    `Existing execution notes:\n${item.executionNotes || "None"}`,
  ].join("\n\n");
}

function extractOutputText(payload: OpenAIResponse): string {
  if (payload.output_text) {
    return payload.output_text.trim();
  }

  const text = payload.output
    ?.flatMap((entry) => entry.content ?? [])
    .map((content) => content.text ?? "")
    .join("\n")
    .trim();

  return text || "OpenAI returned an empty execution result.";
}
