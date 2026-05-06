import { NextResponse } from "next/server";
import { DatabaseNotConfiguredError, resetItemsToSamples } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    const items = await resetItemsToSamples();
    return NextResponse.json({ database: true, items });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return NextResponse.json({ database: false, error: error.message }, { status: 503 });
    }

    console.error(error);
    return NextResponse.json({ database: false, error: "Database operation failed." }, { status: 500 });
  }
}
