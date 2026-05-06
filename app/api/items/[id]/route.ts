import { NextResponse } from "next/server";
import { DatabaseNotConfiguredError, deleteItem, updateItem } from "@/lib/db";
import { draftFromUnknown } from "@/lib/items";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const draft = draftFromUnknown(await request.json());
    const item = await updateItem(id, draft);

    if (!item) {
      return NextResponse.json({ database: true, error: "Item not found." }, { status: 404 });
    }

    return NextResponse.json({ database: true, item });
  } catch (error) {
    return databaseError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteItem(id);

    if (!deleted) {
      return NextResponse.json({ database: true, error: "Item not found." }, { status: 404 });
    }

    return NextResponse.json({ database: true, deleted: true });
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
