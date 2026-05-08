# Dibbes Command Center

**Signal in. Output out.**

Dibbes Command Center is a fast, mobile-first AI execution cockpit. It is not a dashboard. Pick a reusable Signal, paste raw input, press **Execute Signal**, and get a useful result back immediately. Save good outputs to lightweight browser history.

## What it does

- One-screen AI command surface
- Preset Signals:
  - Portrait
  - X Post
  - Structured Meeting Notes
  - Image Prompt
  - App Idea
  - Rewrite Sharper
  - Summary
  - Custom
- AI fills in missing details with strong defaults
- Server-side OpenAI execution through `/app/api/execute/route.ts`
- `OPENAI_API_KEY` stays server-side and is never exposed to browser code
- Copy output
- Save output to local browser history
- Reopen saved outputs from history
- Mobile-first dark premium UI

## How to use signals

1. Open the app.
2. Choose a Signal card.
3. Paste raw input or type a minimal idea.
4. Press **Execute Signal**.
5. Copy or save the result.
6. Rerun after editing the input if you want a sharper result.

Examples:

- **Portrait**: type `bald man, cinematic black/gold portrait, intense calm` and Dibbes returns a complete premium image prompt.
- **Structured Meeting Notes**: paste raw transcript notes and Dibbes returns summary, decisions, actions, questions, risks, and a follow-up message.
- **X Post**: paste a rough thought and Dibbes returns strong, bold, and calmer premium versions.

## Required environment variable

Set this on Vercel and for local development:

```bash
OPENAI_API_KEY="sk-..."
```

Optional model override:

```bash
OPENAI_MODEL="gpt-5.2"
```

For local development, copy the example env file and add your real key:

```bash
cp .env.example .env.local
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add `OPENAI_API_KEY` to Vercel Environment Variables.
4. Add it for Production, Preview, and Development.
5. Deploy.

If you use the Vercel CLI and the project is linked, you can add the environment variables with:

```bash
OPENAI_API_KEY="sk-..." OPENAI_MODEL="gpt-5.2" npm run vercel:env:openai
```

Redeploy after changing Vercel environment variables.

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

## Project structure

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
  storage.ts
package.json
README.md
```
