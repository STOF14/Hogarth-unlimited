# Architecture

Hogarth Unlimited (the app is branded **GUTTER** in-UI) is a single static HTML
file — no build step, no server, no backend. Everything below happens in the
browser tab.

## High-level pipeline

```
File input (any extension, filtered by magic bytes, not accept=)
        │
        ▼
 Header sniff: RAR magic "Rar!" (0x52 0x61 0x72 0x21)?
        │                              │
       yes                             no
        ▼                              ▼
  openRarArchive(buf)             openZipArchive(buf)
  (node-unrar-js WASM,            (JSZip)
   header-only list scan —
   no page decoding yet)
        │                              │
        └──────────────┬───────────────┘
                        ▼
        { imageNames: [...], getComicInfoText(), getPageBlob(name) }
                        │
                        ▼
         Book metadata created + pushed to library
         (title/series/writer/year from ComicInfo.xml if present)
                        │
                        ▼
          getPageUrl(bookId, 0)  ← cover thumbnail only, single page
```

Critically: **importing a file never decodes more than one page.** Only the
list of entries inside the archive is read up front. This was a deliberate
fix after an early version eagerly decoded and blob-ified every page on
import — for a 100+ page full-resolution digital scan, that's 200–400MB+ of
decoded image data held in memory simultaneously, which reliably broke
rendering on mobile Safari.

## Lazy page decoding + cache

```
state.books[bookId] = {
  kind: "zip" | "rar",
  zip / rawData,        // whichever the format needs to re-open on demand
  imageNames,            // sorted list of entry names
  cache: Map<index, blobURL>,
  pending: Map<index, Promise<blobURL>>,
  order: [index, ...],   // insertion order, for LRU eviction
}
```

`getPageUrl(bookId, idx)`:
1. Cache hit → bump to end of `order`, return immediately
2. In-flight → return the existing promise (dedupes concurrent requests for the same page)
3. Otherwise → decode just that one page:
   - **ZIP**: `zip.files[name].async("blob")`
   - **RAR**: create a fresh `Extractor` from the retained raw archive bytes, call `extractor.extract({ files: [name] })` for just that one entry, wrap the result in a `Blob`
4. Cache the resulting object URL, evict the oldest entry if the cache exceeds `CACHE_WINDOW` (6), revoking its object URL to free the memory

### Why a fresh RAR extractor per page, not one reused instance?

`node-unrar-js`'s native (WASM) I/O callbacks route through a single global
`Module.extractor` reference. Reusing one JS `Extractor` object across many
selective `.extract()` calls works in isolation, but interleaving reads
across *different* archives through that same global slot is fragile.
Creating a lightweight extractor per page decode call trades a small amount
of overhead for correctness — verified against a real RAR5 test archive with
out-of-order, non-sequential single-file extraction before shipping.

### Prefetching

`prefetchAround(bookId, idx)` fires (non-blocking, errors swallowed)
whenever a page is displayed, decoding `idx-1`, `idx+1`, `idx+2` in the
background so forward navigation feels instant without ever holding the
whole archive resident.

### Stale-navigation guarding

`goToPage` tags each navigation with an incrementing `_navToken`. If the
user flips past a page before its decode resolves, the stale response is
discarded (`if (myToken !== _navToken) return;`) instead of flashing the
wrong image.

## Continuous-scroll mode

Rather than decoding every page for scroll mode, placeholder `<div>`s are
rendered for every page and an `IntersectionObserver` (600px root margin)
swaps each one for a real `<img>` — decoded via the same `getPageUrl` cache
— only once it's about to enter the viewport.

## Storage model

Two separate concerns, intentionally not conflated:

| Data | Where | Survives reload? |
|---|---|---|
| Decoded page images (blob URLs) | In-memory only (`state.books`) | No — browser sandbox has no persistent binary file storage available to a static site |
| Library metadata (title, tags, reading progress, `ComicInfo.xml` fields) | Artifact `window.storage` API, JSON | Yes |

`saveLibrary()` writes a slimmed-down version of `state.library` (no image
data) and is debounced to 500ms so rapid page-turning doesn't spam writes.

## RAR/unrar engine

See [`tools/unrar-build/README.md`](../tools/unrar-build/README.md) for how
the embedded WASM engine is built and how to reproduce or update it.
