# Dibbes Refine

**Input anything. Reveal the signal.**

Dibbes Refine is a premium AI refinement engine for creators, founders, and brands who want sharper, clearer, more human, more original output. It is built around a minimal brand architecture: **DIBBES** as the small maison-style brand mark and **REFINE** as the product wordmark.

## Core promise

Input anything. Reveal the signal.

## Positioning

A premium AI refinement engine for people who refuse generic output.

## What it does

1. Paste or type raw material: a rough thought, draft, post, prompt, idea, caption, product message, or brand sentence.
2. Select refinement intents such as sharper, more human, more premium, more concise, or more strategic.
3. Adjust Brand DNA so the result stays aligned with the intended voice, audience, values, and visual style.
4. Press **Refine Signal**.
5. Review stronger, sharper, more human refinement options with quality scoring and rationale.
6. Optionally generate a premium visual direction and image prompt.
7. Refine again when the first pass can be pushed further.

## Visual direction

- Deep black foundation
- Ivory text and surfaces
- Refined gold accents
- Premium minimalism
- Sharp typography
- Quiet luxury
- No clutter

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel-ready
- OpenAI Responses API via server-side route only
- Optional OpenAI image generation via server-side route only
- `OPENAI_API_KEY` loaded from Vercel environment variables
- No client-side API key exposure
- No auth
- No database

## Required structure

```text
app/
  api/
    refine/
      route.ts
    image/
      route.ts
  page.tsx
  layout.tsx
  globals.css
components/
  BeforeAfter.tsx
  BrandDNA.tsx
  ImagePreview.tsx
  IntentSelector.tsx
  OutputCards.tsx
  RefineInput.tsx
lib/
  openai.ts
  prompts.ts
  quality.ts
  storage.ts
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
4. Paste messy source material.
5. Choose refinement intents and Brand DNA.
6. Press **Refine Signal**.
7. Refined outputs, quality scoring, and rationale appear.
8. Copy works.
9. Optional visual generation works when enabled.
10. Refresh page.
11. Last input, Brand DNA, and output remain available locally.
