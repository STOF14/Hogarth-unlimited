# Changelog

All notable changes to this project are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Repo scaffolding: README, LICENSE, CI deploy workflow, issue/PR templates, architecture docs

## [0.3.0] — RAR support + lazy decoding

### Added
- Real in-browser `.cbr` (RAR, including RAR5) support via a compiled WASM build of `node-unrar-js` — no conversion step required
- Lazy, on-demand page decoding with a rolling LRU cache (6 pages resident) — replaces the earlier eager "decode the whole archive on import" approach, which could exhaust memory on long, full-resolution issues
- Prefetching of ±1–2 pages around the current position
- Stale-navigation guarding so fast page-flipping can't race and show the wrong page
- `IntersectionObserver`-driven decoding for continuous-scroll mode
- Per-page error toast instead of a silent broken image on decode failure
- Debounced library saves (500ms) instead of saving on every page turn

### Fixed
- File picker on iOS no longer grays out `.cbr` files — removed the `accept` attribute, which iOS couldn't resolve to a known file type (UTI) for unregistered extensions; format is instead detected from the file's magic bytes after selection

## [0.2.0] — Daily-driver features

### Added
- `ComicInfo.xml` metadata parsing (series, issue number, writer, penciller, year)
- Tags/collections (Marvel / DC / Crossover / custom) with per-card accent coloring
- Search across title, series, and tags
- Library stats strip (issues, pages read, completed)
- Zoom + drag-to-pan in the reader
- Metadata/progress persistence across reloads via artifact storage

## [0.1.0] — MVP

### Added
- CBZ (ZIP) import with natural page-order sorting
- Paged and continuous-scroll reading modes
- Library grid with auto-generated cover thumbnails
- Marvel/DC-inspired visual design (halftone background, gutter-rule motif, corner "issue stamp")
