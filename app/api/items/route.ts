import { NextResponse } from "next/server";
import { DatabaseNotConfiguredError, insertItem, listItems } from "@/lib/db";
import { draftFromUnknown } from "@/lib/items";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await listItems();
    return NextResponse.json({ database: true, items });
  } catch (error) {
    return databaseError(error);
  }
}

export async function POST(request: Request) {
  try {
    const draft = draftFromUnknown(await request.json());
    const item = await insertItem(draft);
    return NextResponse.json({ database: true, item }, { status: 201 });
  } catch (error) {
    return databaseError(error);
  }
}

function databaseError(error: unknown) {
  if (error instanceof DatabaseNotConfiguredError) {
    return NextResponse.json({ database: false, error: error.message }, { status: 503 });
  }

  console.error(error);
  return NextResponse.json({ database: false, error: "Database operation failed." }, { status: 500 });
}
