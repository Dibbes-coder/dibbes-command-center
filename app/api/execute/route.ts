import { NextResponse } from "next/server";
import { executeSignal, parseSignalType } from "@/lib/openai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ExecuteRequest = {
  signalType?: unknown;
  input?: unknown;
  customInstruction?: unknown;
};

export async function POST(request: Request) {
  let body: ExecuteRequest;

  try {
    body = (await request.json()) as ExecuteRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const result = await executeSignal({
      signalType: parseSignalType(body.signalType),
      input: typeof body.input === "string" ? body.input : "",
      customInstruction: typeof body.customInstruction === "string" ? body.customInstruction : undefined,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Execution failed. Try again.";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
