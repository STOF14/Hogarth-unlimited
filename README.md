# Hogarth Unlimited

A personal, browser-based comic reader — CBZ **and CBR**, fully client-side, no server, no account, no upload. Built as a from-scratch alternative to needing a native app just to read your own digital comics collection.

The reader itself is branded **GUTTER** in the UI; *Hogarth Unlimited* is the project/repo name.

**[Live demo →](https://stof14.github.io/Hogarth-unlimited/)** *(enable GitHub Pages on this repo — see [Deployment](#deployment))*

---

## Why this exists

Most in-browser comic readers only handle `.cbz` (ZIP) because RAR is a proprietary format with no native browser decoder. This project runs an actual WASM build of the official `unrar` source in the browser, so `.cbr` files work with zero conversion step — pick the file, read it.

## Features

**Reading**
- CBZ (ZIP) and CBR (RAR, incl. RAR5) import — format detected from file bytes, not extension
- `ComicInfo.xml` metadata parsing (series, issue #, writer, penciller, year)
- Paged mode (tap zones + arrow keys) and continuous scroll mode
- Double-tap/click zoom with drag-to-pan
- Reading progress persisted per issue

**Library**
- Grid view with auto-generated cover thumbnails
- Custom tags/collections (Marvel / DC / Crossover / freeform), with accent colors reflected on each card
- Search across title, series, and tags
- Library-wide stats (issues, pages read, completed)

**Architecture**
- **Lazy, on-demand page decoding** with a small rolling LRU cache (currently 6 pages resident) — a 100+ page full-resolution scan won't blow out mobile Safari's memory, because only the pages near your current position are ever decoded
- Prefetches ±1–2 pages ahead so navigation feels instant without loading the whole archive
- Stale-navigation guarding — flipping pages quickly discards in-flight decodes that are no longer relevant instead of racing
- `IntersectionObserver`-driven decoding in continuous-scroll mode

## Limitations (by design, not oversight)

| Limitation | Why |
|---|---|
| No password-protected or multi-volume RAR (`.part1.rar`, `.r00`) | Not supported by the underlying `node-unrar-js` build |
| Page images don't survive a page reload | Browser sandbox — no persistent file storage API available to a static site; re-import to continue |
| Large archives can briefly pause the UI while a page decodes | RAR decompression runs synchronously on the main thread (no Worker yet — see [Roadmap](#roadmap)) |
| Metadata (tags, progress, titles) *does* persist across reloads | Stored separately from page image data |

## Getting started

This is a static site — no build step required to run it.

```bash
git clone https://github.com/STOF14/Hogarth-unlimited.git
cd Hogarth-unlimited
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` directly in a browser.

## Deployment

Deploys to GitHub Pages automatically via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to `main`. To enable it the first time:

1. Repo **Settings → Pages → Source** → select **GitHub Actions**
2. Push to `main` — the workflow publishes `index.html` as-is (no build step needed for the site itself)

## Rebuilding the RAR engine

The embedded RAR/unrar WASM engine is **not hand-written** — it's a real compiled build of [`node-unrar-js`](https://github.com/YuJianrong/node-unrar-js) (which wraps the official unrar C++ source), bundled for the browser and inlined into `index.html`. The bundling process is fully scripted and reproducible — see [`tools/unrar-build/`](tools/unrar-build/) for the exact steps and to regenerate it (e.g. after a `node-unrar-js` version bump).

## Project structure

```
.
├── index.html                  # the entire app — single static file, deployable as-is
├── tools/unrar-build/          # scripted, reproducible build of the embedded RAR/unrar WASM engine
├── docs/ARCHITECTURE.md        # deeper write-up of the lazy-decode/cache model and storage schema
├── .github/workflows/          # CI — GitHub Pages deploy
└── .github/ISSUE_TEMPLATE/     # bug/feature report templates
```

## Roadmap

- [ ] Move RAR/ZIP decoding off the main thread into a Web Worker
- [ ] Panel-aware zoom (auto-detect panel boundaries)
- [ ] Reading-order-aware collections (continuity-mode sequencing, à la Earth-616/Earth-828)
- [ ] Native app build (React Native or Swift) for true offline page persistence

See [CHANGELOG.md](CHANGELOG.md) for what's shipped so far.

## Credits

- [`node-unrar-js`](https://github.com/YuJianrong/node-unrar-js) — WASM RAR extraction
- [`JSZip`](https://github.com/Stuk/jszip) — ZIP extraction
- Fonts: [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue), [Manrope](https://fonts.google.com/specimen/Manrope), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (Google Fonts)

## License

[MIT](LICENSE) — see file for details.
