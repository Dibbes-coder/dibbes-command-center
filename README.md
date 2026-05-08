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
- One-click Save + Execute flow that stores the signal before opening execution
- Execution panel with type-specific actions:
  - X Post copy-ready post draft
  - Image Prompt copy-ready image prompt
  - Prompt / AI Workflow copy-ready AI instruction
  - Project / Experiment / Idea checklist
- OpenAI execution outcomes automatically saved back to each item as execution notes
- `Executed` status and Mark executed flow
- Minimal full-text search across titles, tags, content, actions, and execution notes
- Dedicated signal screen for capturing source, context, tags, priority, next action, and execution notes
- Clear JSON backup, sample restore, and delete-all controls
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

Local execution works without API keys. To enable the **Generate with OpenAI** button, configure `OPENAI_API_KEY` as an environment variable. Do **not** commit a real API key to this repository; `.env*` files are ignored by Git and `.env.example` contains placeholders only.

### Local development

Copy the example file and replace the placeholder with your real key:

```bash
cp .env.example .env.local
```

```bash
OPENAI_API_KEY="sk-REPLACE_WITH_YOUR_OPENAI_API_KEY"
```

Optional model override:

```bash
OPENAI_MODEL="gpt-5.2"
```

### Vercel production, preview, and development

Add the same environment variable in all three Vercel environments so OpenAI execution works consistently. If you are logged into Vercel CLI and the project is linked, you can run:

```bash
OPENAI_API_KEY="sk-..." OPENAI_MODEL="gpt-5.2" npm run vercel:env:openai
```

Or add the values manually:

```bash
vercel env add OPENAI_API_KEY production
vercel env add OPENAI_API_KEY preview
vercel env add OPENAI_API_KEY development
```

If you override the model, add `OPENAI_MODEL` to the same environments as well. Redeploy after changing Vercel environment variables.

The API key is only read by `app/api/execute/route.ts`; it is never sent to the browser. If the key is missing, the UI keeps the local copy/checklist execution flow working.

## Production build

```bash
npm run build
npm start
```

## Vercel deployment

Deploy this repository directly from GitHub on Vercel. No environment variables are required for localStorage execution. Add `OPENAI_API_KEY` if you want OpenAI-powered execution drafts.
