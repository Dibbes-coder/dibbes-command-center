# Dibbes Command Center

**Signal. Speed. Precision.**

A clean, Vercel-deployable Next.js App Router execution dashboard for capturing signals, refining them into useful assets, copying execution-ready output, and marking work complete.

## What is included

- Next.js App Router
- TypeScript
- Tailwind CSS
- Browser-only execution flow
- No backend, API keys, authentication, or database required
- `localStorage` persistence
- Sample data seeded on first run
- Create, edit, execute, and delete items
- Execution panel with type-specific actions:
  - X Post copy-ready post draft
  - Image Prompt copy-ready image prompt
  - Prompt / AI Workflow copy-ready AI instruction
  - Project / Experiment / Idea checklist
- Execution notes saved back to each item
- `Executed` status and Mark executed flow
- Dashboard counts by type and status
- Search and filters for type, status, and tag
- Ready to Ship, Raw Signals, Prompt Lab, and Executed views
- JSON export and Delete all data control
- Commented future integration point for OpenAI API features

## Root structure

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

Do not move `page.tsx`, `layout.tsx`, or `globals.css` out of `/app`, and do not wrap the app in an extra folder.

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

Deploy this repository directly from GitHub on Vercel. No environment variables or external services are required for the current browser-only version.
