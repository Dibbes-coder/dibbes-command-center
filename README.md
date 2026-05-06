# Dibbes Command Center

**Signal. Speed. Precision.**

A clean, Vercel-deployable Next.js App Router dashboard for capturing AI signals, prompts, projects, workflows, experiments, and ship-ready ideas.

## What is included

- Next.js App Router
- TypeScript
- Tailwind CSS
- Postgres database persistence through `DATABASE_URL` or Vercel Postgres `POSTGRES_URL`
- Automatic database table creation on first request
- Sample data seeded when the database is empty
- localStorage fallback when no database is configured
- Create, edit, and delete items
- Dashboard counts by type and status
- Search and filters for type, status, and tag
- Ready to Ship, Raw Signals, and Prompt Lab views
- JSON export
- Commented future integration points for Notion sync and OpenAI API features

## Root structure

```text
app/page.tsx
app/layout.tsx
app/globals.css
app/api/items/route.ts
app/api/items/[id]/route.ts
app/api/items/seed/route.ts
components/CommandCenter.tsx
lib/db.ts
lib/items.ts
lib/storage.ts
lib/sample-data.ts
package.json
README.md
next.config.ts
tailwind.config.ts
postcss.config.mjs
tsconfig.json
```

## Database setup

Create a Postgres database in Vercel, Neon, Supabase, Railway, or any hosted Postgres provider. Add one of these environment variables to Vercel:

```bash
DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

Vercel Postgres also works with:

```bash
POSTGRES_URL="postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

The app creates the `command_items` table and indexes automatically on the first API request, then seeds the sample data if the table is empty.

If neither variable exists, the app remains usable through the built-in localStorage fallback and displays that mode in the header.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

To test database persistence locally, create a `.env.local` file with `DATABASE_URL` and restart the dev server.

## Production build

```bash
npm run build
npm start
```

## Vercel deployment

Deploy this repository directly from GitHub on Vercel. Add `DATABASE_URL` or connect Vercel Postgres in the project settings for durable persistence.
