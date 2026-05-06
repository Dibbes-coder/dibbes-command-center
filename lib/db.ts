import { Pool, type QueryResultRow } from "pg";
import { makeItem, reviseItem, type CommandItem, type ItemDraft } from "./items";
import { sampleItems } from "./sample-data";

type ItemRow = QueryResultRow & {
  id: string;
  title: string;
  type: CommandItem["type"];
  status: CommandItem["status"];
  energy: CommandItem["energy"];
  tags: string[] | string;
  content: string;
  next_action: string;
  created_at: Date | string;
  updated_at: Date | string;
};

type GlobalWithPool = typeof globalThis & {
  dibbesCommandCenterPool?: Pool;
};

const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL_NON_POOLING;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("Set DATABASE_URL or POSTGRES_URL to enable persistent database storage.");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(connectionString);
}

export async function listItems(): Promise<CommandItem[]> {
  const pool = getPool();
  await ensureSchema();
  await seedDatabaseIfEmpty();

  const result = await pool.query<ItemRow>(`
    SELECT id, title, type, status, energy, tags, content, next_action, created_at, updated_at
    FROM command_items
    ORDER BY updated_at DESC
  `);

  return result.rows.map(rowToItem);
}

export async function insertItem(draft: ItemDraft): Promise<CommandItem> {
  const pool = getPool();
  await ensureSchema();
  const item = makeItem(draft);

  const result = await pool.query<ItemRow>(
    `
      INSERT INTO command_items (id, title, type, status, energy, tags, content, next_action, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10)
      RETURNING id, title, type, status, energy, tags, content, next_action, created_at, updated_at
    `,
    [
      item.id,
      item.title,
      item.type,
      item.status,
      item.energy,
      JSON.stringify(item.tags),
      item.content,
      item.nextAction,
      item.createdAt,
      item.updatedAt,
    ],
  );

  return rowToItem(result.rows[0]);
}

export async function updateItem(id: string, draft: ItemDraft): Promise<CommandItem | null> {
  const pool = getPool();
  await ensureSchema();
  const existing = await getItem(id);

  if (!existing) {
    return null;
  }

  const item = reviseItem(existing, draft);
  const result = await pool.query<ItemRow>(
    `
      UPDATE command_items
      SET title = $2,
          type = $3,
          status = $4,
          energy = $5,
          tags = $6::jsonb,
          content = $7,
          next_action = $8,
          updated_at = $9
      WHERE id = $1
      RETURNING id, title, type, status, energy, tags, content, next_action, created_at, updated_at
    `,
    [
      item.id,
      item.title,
      item.type,
      item.status,
      item.energy,
      JSON.stringify(item.tags),
      item.content,
      item.nextAction,
      item.updatedAt,
    ],
  );

  return result.rows[0] ? rowToItem(result.rows[0]) : null;
}

export async function deleteItem(id: string): Promise<boolean> {
  const pool = getPool();
  await ensureSchema();
  const result = await pool.query("DELETE FROM command_items WHERE id = $1", [id]);

  return Number(result.rowCount) > 0;
}

export async function resetItemsToSamples(): Promise<CommandItem[]> {
  const pool = getPool();
  await ensureSchema();

  await pool.query("DELETE FROM command_items");
  await Promise.all(sampleItems.map((item) => upsertItem(item)));

  return listItems();
}

async function getItem(id: string): Promise<CommandItem | null> {
  const pool = getPool();
  const result = await pool.query<ItemRow>(
    `
      SELECT id, title, type, status, energy, tags, content, next_action, created_at, updated_at
      FROM command_items
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ? rowToItem(result.rows[0]) : null;
}

async function seedDatabaseIfEmpty(): Promise<void> {
  const pool = getPool();
  const result = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM command_items");

  if (Number(result.rows[0]?.count ?? 0) > 0) {
    return;
  }

  await Promise.all(sampleItems.map((item) => upsertItem(item)));
}

async function upsertItem(item: CommandItem): Promise<void> {
  const pool = getPool();
  await pool.query(
    `
      INSERT INTO command_items (id, title, type, status, energy, tags, content, next_action, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE
      SET title = EXCLUDED.title,
          type = EXCLUDED.type,
          status = EXCLUDED.status,
          energy = EXCLUDED.energy,
          tags = EXCLUDED.tags,
          content = EXCLUDED.content,
          next_action = EXCLUDED.next_action,
          updated_at = EXCLUDED.updated_at
    `,
    [
      item.id,
      item.title,
      item.type,
      item.status,
      item.energy,
      JSON.stringify(item.tags),
      item.content,
      item.nextAction,
      item.createdAt,
      item.updatedAt,
    ],
  );
}

async function ensureSchema(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS command_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      energy TEXT NOT NULL,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      content TEXT NOT NULL DEFAULT '',
      next_action TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query("CREATE INDEX IF NOT EXISTS command_items_status_idx ON command_items (status)");
  await pool.query("CREATE INDEX IF NOT EXISTS command_items_type_idx ON command_items (type)");
  await pool.query("CREATE INDEX IF NOT EXISTS command_items_updated_at_idx ON command_items (updated_at DESC)");
}

function getPool(): Pool {
  if (!connectionString) {
    throw new DatabaseNotConfiguredError();
  }

  const globalWithPool = globalThis as GlobalWithPool;

  if (!globalWithPool.dibbesCommandCenterPool) {
    globalWithPool.dibbesCommandCenterPool = new Pool({
      connectionString,
      max: 5,
      ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
    });
  }

  return globalWithPool.dibbesCommandCenterPool;
}

function rowToItem(row: ItemRow): CommandItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    status: row.status,
    energy: row.energy,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : JSON.parse(row.tags || "[]"),
    content: row.content,
    nextAction: row.next_action,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}
