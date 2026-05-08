# SignalForge

**One input. One execution. Stored.**

SignalForge is a mobile-first AI execution app for fast reusable AI actions called **Signals**. It is intentionally not a dashboard, workspace, CRM, database, or settings-heavy tool. It is a fast personal AI command surface.

## What it does

1. Select a Signal.
2. Paste or type raw input.
3. SignalForge fills in missing details server-side with OpenAI.
4. Press **Execute Signal**.
5. Copy, save, or clear the output.
6. Saved results persist in `localStorage` and survive refreshes.

## Signals

- Portrait
- Image Prompt
- X Post
- Meeting Notes
- Rewrite
- Summary
- App Builder
- Custom

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel-ready
- OpenAI Responses API via server-side route only
- `OPENAI_API_KEY` loaded from Vercel environment variables
- No client-side API key exposure
- No auth
- No database
- No sidebar

## Required structure

```text
app/
  api/
    execute/
      route.ts
  page.tsx
  layout.tsx
  globals.css
components/
  SignalCard.tsx
  OutputPanel.tsx
  HistoryPanel.tsx
lib/
  signals.ts
  openai.ts
  types.ts
package.json
README.md
```

The repository root directly contains `app/`, `components/`, `lib/`, `package.json`, and `README.md`.

## Environment variables

Set this in Vercel:

```bash
OPENAI_API_KEY=your_api_key_here
```

Optional model override:

```bash
OPENAI_MODEL=gpt-5.1
```

If `OPENAI_API_KEY` is missing, the API returns:

```text
Missing OPENAI_API_KEY in Vercel environment variables.
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

## Vercel acceptance test

1. Deploy to Vercel.
2. Add `OPENAI_API_KEY` in Vercel Environment Variables.
3. Redeploy.
4. Select **Meeting Notes**.
5. Paste messy notes.
6. Execute.
7. Structured output appears.
8. Copy works.
9. Save works.
10. Refresh page.
11. Saved history remains.
