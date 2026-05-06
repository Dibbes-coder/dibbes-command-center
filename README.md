# Dibbes Command Center

**Signal. Speed. Precision.**

A clean, browser-only Next.js App Router dashboard for capturing AI signals, prompts, projects, workflows, experiments, and ship-ready ideas.

## What is included

- Next.js App Router
- TypeScript
- Tailwind CSS
- No backend
- No authentication
- No database
- `localStorage` persistence
- Sample data seeded on first run
- Create, edit, and delete items
- Dashboard counts by type and status
- Search and filters for type, status, and tag
- Ready to Ship, Raw Signals, and Prompt Lab views
- JSON export
- Commented future integration points for Notion sync and OpenAI API features

## Required root structure

```text
app/page.tsx
app/layout.tsx
app/globals.css
components/CommandCenter.tsx
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

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Production build

```bash
npm run build
npm start
```

## Vercel deployment

Deploy this repository directly from GitHub on Vercel. No environment variables or external services are required.
