import { NextResponse } from "next/server";
import { executeSignal } from "@/lib/openai";
import type { ExecuteRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ExecuteRequest>;
    const signalType = String(body.signalType ?? "Custom");
    const input = String(body.input ?? "");
    const customInstruction = body.customInstruction ? String(body.customInstruction) : undefined;
    const portraitPreset = body.portraitPreset ? String(body.portraitPreset) : undefined;
    const generateImage = Boolean(body.generateImage);

    const result = await executeSignal({ signalType, input, customInstruction, generateImage, portraitPreset });

    return NextResponse.json({ output: result.output, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signal execution failed.";

    return NextResponse.json({ error: message, output: message }, { status: 500 });
  }
}
