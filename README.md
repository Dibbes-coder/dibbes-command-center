# Dibbes Command Center

**Signal. Speed. Precision.**

A clean, Vercel-deployable Next.js App Router execution dashboard focused on one loop: add, execute, store.

## What is included

- Next.js App Router
- TypeScript
- Tailwind CSS
- Browser-only local execution flow with optional OpenAI API execution
- Server-side OpenAI API route that keeps `OPENAI_API_KEY` out of the browser
- No authentication or database required
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
- Search and filters for type, status, and tag
- Simple saved-item views for Ready to Ship, Raw Signals, Prompt Lab, and Executed work
- JSON export and Delete all data control
- OpenAI execution uses the Responses API when `OPENAI_API_KEY` is configured

## Root structure

```text
app/page.tsx
app/layout.tsx
app/globals.css
app/api/execute/route.ts
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

## OpenAI API execution

Local execution works without API keys. To enable the **Generate with OpenAI** button, add this to `.env.local` locally or to Vercel environment variables:

```bash
OPENAI_API_KEY="sk-..."
```

Optional model override:

```bash
OPENAI_MODEL="gpt-5.2"
```

The API key is only read by `app/api/execute/route.ts`; it is never sent to the browser. If the key is missing, the UI keeps the local copy/checklist execution flow working.

## Production build

```bash
npm run build
npm start
```

## Vercel deployment

Deploy this repository directly from GitHub on Vercel. No environment variables are required for localStorage execution. Add `OPENAI_API_KEY` if you want OpenAI-powered execution drafts.
