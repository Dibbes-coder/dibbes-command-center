# SignalForge

**One input. One execution. Stored.**

SignalForge is a mobile-first AI execution cockpit for fast reusable AI actions called **Signals**. It is intentionally not a dashboard, workspace, CRM, database, or settings-heavy tool. It is a fast personal AI command surface where a rough signal becomes a polished result.

## What it does

1. Select a Signal.
2. Paste or type minimal raw input.
3. SignalForge fills in missing details server-side with OpenAI.
4. Press **Execute Signal**.
5. Copy, save, clear, or download image results.
6. Saved results persist in `localStorage` and survive refreshes.

## Visual execution

Two Signals support image generation:

- **Portrait** expands minimal input into a premium 4:5 portrait prompt and automatically generates an image.
- **Image Prompt** creates a polished prompt by default and includes a **Generate image too** toggle when a finished image is needed.

Visual results show the generated image, final prompt used, creative rationale, copy/save controls, and image download when image data is available.

## Signals

- Portrait
- Image Prompt
- X Post
- Meeting Notes
- Rewrite
- Summary
- App Builder
- Custom

## Quality standard

SignalForge uses a shared quality layer that instructs the model to produce outputs that are specific, tasteful, useful, polished, emotionally intelligent, concise, and immediately usable. Visual outputs additionally avoid generic stock-photo energy, overprocessed HDR, plastic skin, fake logos, unreadable text, messy UI, and clutter.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel-ready
- OpenAI Responses API for text and prompt expansion
- OpenAI Image API for generated images
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
  quality.ts
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

Optional model overrides:

```bash
OPENAI_MODEL=gpt-5.1
OPENAI_IMAGE_MODEL=gpt-image-1
```

If `OPENAI_API_KEY` is missing, the API returns:

```text
Missing OPENAI_API_KEY in Vercel environment variables.
```

If image generation fails after prompt creation, the app still shows the prompt and displays:

```text
Image generation failed, but your prompt was created successfully.
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
6. Execute and confirm structured text output appears.
7. Select **Portrait**.
8. Enter a minimal portrait direction.
9. Execute and confirm an image appears directly in the app.
10. Open **Prompt Used** and confirm the prompt is visible.
11. Copy the prompt.
12. Save the result.
13. Refresh page.
14. Reopen the saved item from history.
