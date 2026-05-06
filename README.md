# Dibbes Command Center

**Signal. Speed. Precision.**

A browser-based MVP personal AI dashboard for capturing and organizing:

- Ideas
- X posts
- Image prompts
- Projects
- Experiments
- AI workflows

This is intentionally **local-first**: no backend, no auth, no database. Data is stored in `localStorage` in the browser.

---

## What is included

- Next.js App Router
- TypeScript
- Tailwind CSS
- Browser-only localStorage persistence
- Create, edit, delete items
- Fields: title, type, status, energy, tags, content, next action, created date, updated date
- Dashboard counts by type and status
- Search
- Filters by type, status, and tag
- Dedicated views:
  - Dashboard
  - Ready to Ship
  - Raw Signals
  - Prompt Lab
- JSON export
- Premium dark command-center UI

---

## File structure

```txt
dibbes-command-center/
├─ app/
│  ├─ globals.css          # Global Tailwind styles and reusable field styling
│  ├─ layout.tsx           # App metadata and root layout
│  └─ page.tsx             # Main route
├─ components/
│  └─ CommandCenter.tsx    # Complete client-side MVP UI and interactions
├─ lib/
│  ├─ items.ts             # Item types, helpers, creation/update utilities
│  ├─ sample-data.ts       # First-run seed items
│  └─ storage.ts           # localStorage persistence + future sync hook comments
├─ next.config.ts
├─ package.json
├─ postcss.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json
└─ README.md
```

---

## Deploy to Vercel without running anything locally

### 1. Create the GitHub repository

1. Download or unzip this project folder.
2. Go to GitHub.
3. Click **New repository**.
4. Name it, for example: `dibbes-command-center`.
5. Keep it private or public — your choice.
6. Create the repo **without** adding a README, license, or `.gitignore`, because this package already includes them.

### 2. Upload the files to GitHub

1. Open the new empty GitHub repo.
2. Click **Add file → Upload files**.
3. Drag the **contents** of this folder into GitHub.
   - Upload `app`, `components`, `lib`, `package.json`, `README.md`, etc.
   - Do **not** upload a parent folder around the project.
4. Click **Commit changes**.

### 3. Import into Vercel

1. Go to the Vercel dashboard.
2. Click **Add New → Project**.
3. Import the GitHub repository.
4. Vercel should auto-detect **Next.js**.
5. Keep defaults:
   - Framework Preset: `Next.js`
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: leave default
6. Click **Deploy**.

No environment variables are needed.

### 4. Use it

After deployment, open the Vercel URL. Your data will be stored in that browser’s `localStorage`.

Important: because this MVP has no backend, data is device/browser-specific.. If you open it on another device, it will start with fresh local data.

---

## Optional local commands

Only for environments where local Node usage is allowed:

```bash
npm install
npm run dev
npm run build
```

---

## Future upgrade points

### Notion sync

See `lib/storage.ts`:

```ts
// Future Notion sync hook:
// Queue changed items here and sync them to a Notion database once auth/backend exists.
```

Recommended next version:

- Add auth
- Create a Notion database schema matching the item model
- Add `/api/notion-sync`
- Sync changed items from localStorage to Notion
- Pull Notion items back into the dashboard

### OpenAI API features

See `components/CommandCenter.tsx` near the composer footer:

```tsx
Future OpenAI API hook: add a server route here later to turn rough content into variants, summaries, image prompts or next actions.
```

Recommended next AI features:

- Turn raw signal into 5 X post variants
- Improve image prompts
- Generate next actions
- Classify type/status automatically
- Score “ship readiness”
- Create reusable AI workflow templates

---

## MVP philosophy

This is not a todo app.

It is a personal creative command center:

> Capture weak signals fast. Shape what has voltage. Ship before the spark cools.

