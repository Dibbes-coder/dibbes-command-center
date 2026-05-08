import { NextResponse } from "next/server";
import { generateSignalImage } from "@/lib/openai";
import type { ImageRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ImageRequest>;
    const prompt = String(body.prompt ?? "").trim();

    if (!prompt) {
      return NextResponse.json({ error: "Image prompt is required." }, { status: 400 });
    }

    const imageUrl = await generateSignalImage(prompt);
    return NextResponse.json({ imageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
