# Dibbes Refine

Dibbes Refine is a minimal, premium X reply-refinement app for one personal workflow: paste a post, optionally add a rough reply and intent, then get sharper reply options that feel human, high-signal, and worth noticing.

It is a reply sharpener, not a generic tweet generator.

## What it returns

Each refinement produces:

1. Best Reply
2. Sharper Reply
3. Warmer Reply
4. Bolder Reply
5. Quote Post Angle
6. “Don’t post this if…” warning
7. Quality score with specific reasons and one improvement tip

Each reply option includes a copy button, character count, and a short note explaining why it works.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- OpenAI official JavaScript SDK
- OpenAI Responses API
- Vercel-ready deployment
- No database
- Local profile, preferences, and history via `localStorage`

## Local setup

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env.local
```

Add your server-side OpenAI API key:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.5
```

## Run locally

```bash
npm run dev
```

Open the local URL printed by Next.js, usually `http://localhost:3000`.

## Build

```bash
npm run build
```

You can also run TypeScript directly:

```bash
npm run typecheck
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the project into Vercel.
3. Add environment variables in Vercel Project Settings:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional, defaults to `gpt-5.5`)
4. Deploy.

The OpenAI API key is used only in the server-side API route and is never exposed to the browser.

## MVP limitations

- No authentication.
- No database or cloud sync.
- No X login.
- No X API integration.
- No auto-posting.
- Local history is limited to the last five refinements and stays on the current device/browser.
- The app expects pasted context; it does not fetch posts from URLs yet.

## Future roadmap

Phase 1: Personal copy-paste reply sharpener  
Phase 2: Browser extension / share-sheet input  
Phase 3: Screenshot or URL input  
Phase 4: Personal reply memory  
Phase 5: Reply radar for high-value posts  
Phase 6: Optional X API integration only if pricing and usage justify it
