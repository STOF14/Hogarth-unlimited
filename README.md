# Hogarth Unlimited

A personal comic (CBZ/CBR) library and reader. Single user, server-side
extraction, everything persists.

**Status: Phases 1–2 done (backend + frontend). Phase 3 (Docker/deploy/CI-deploy/PWA
polish) is not built yet — see "What's not done" below before you rely on this
day to day.**

## Architecture

- **Backend** — Fastify + TypeScript, SQLite via Prisma, comic archives
  extracted server-side (CBZ via `yauzl`, CBR via `node-unrar-js`) into WebP
  pages stored in S3-compatible object storage (Cloudflare R2). No queue
  system — extraction runs fire-and-forget after upload, client polls for
  status. Good enough at single-user scale; see the comment in
  `backend/src/lib/importComic.ts` for the known limitation.
- **Frontend** — React + TypeScript + Vite, TanStack Query for server state,
  Zustand for local UI state only, Tailwind with the original app's
  halftone/gutter design tokens carried over.
- **Auth** — one bearer token (`API_TOKEN`), checked on every API request.
  No user table, no sessions — this is intentional for a single-user app,
  not an oversight. See `backend/src/auth.ts`.

Full reasoning for these choices is in the conversation that produced this
rebuild; the short version is in each file's top comment.

## Working in GitHub Codespaces (iPad workflow)

1. Open this repo → **Code → Codespaces → Create codespace on main**.
   `.devcontainer/devcontainer.json` handles the rest (installs both
   `npm install`s, generates the Prisma client, forwards ports 3000/5173).
2. Copy env files and fill them in (see next section):
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. Run the DB migration once:
   ```bash
   cd backend && npx prisma migrate dev --name init
   ```
4. Two terminals:
   ```bash
   cd backend && npm run dev     # http://localhost:3000
   cd frontend && npm run dev    # http://localhost:5173
   ```
5. Codespaces will prompt to open a preview for port 5173 — that works fine
   in Safari on the iPad. Make sure port 3000 is set to **Public** (or at
   least reachable) in the Ports tab, or the frontend's fetch calls to it
   will fail with CORS/visibility errors.

## Environment variables

**`backend/.env`**
- `API_TOKEN` — generate with `openssl rand -hex 32`. This is the password
  for your whole library; treat it like one.
- `S3_ENDPOINT` / `S3_BUCKET` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` —
  from your R2 bucket (Cloudflare dashboard → R2 → Manage API tokens).
- `S3_PUBLIC_BASE_URL` — leave blank to use presigned URLs (simplest, works
  immediately). Set it only if you put the bucket behind a custom domain.
- `WEB_ORIGIN` — the frontend's origin, for CORS.

**`frontend/.env`**
- `VITE_API_BASE_URL` — where the backend is reachable from the browser.
- `VITE_API_TOKEN` — same value as backend's `API_TOKEN`.

## What's not done (Phase 3+)

- **No combined Dockerfile / Fly.io deploy yet.** `backend/Dockerfile`
  exists and builds correctly on its own, but there's no step that bundles
  the built frontend into it, no `fly.toml`, and no CI *deploy* job (CI
  currently only typechecks + builds on push, see
  `.github/workflows/ci.yml`).
- **No PWA icons** — `manifest.webmanifest` exists but has an empty `icons`
  array, so "Add to Home Screen" on the iPad will use a generic icon.
- **No stale-"processing"-row sweep** — if the backend process dies mid
  import, that comic stays stuck at "processing" until you delete it
  manually (see the comment in `importComic.ts`).
- **No tests.** Given for now nothing here, worth adding at least around
  `archiveReader.ts` and `naturalSort.ts` before this grows further.

## What's carried over from the original prototype

The halftone background, the Marvel-red/DC-blue/gold palette, Bebas
Neue/Manrope/JetBrains Mono typography, and the lazy lightweight reading
experience — all intentional, all kept. What changed is *where* the heavy
lifting happens: extraction moved from in-browser WASM to the server, and
`window.storage` (which only exists inside Claude's own sandbox, not on a
real host) was replaced with a real database plus real object storage.
