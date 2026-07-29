import { useEffect } from "react";
import { api } from "../lib/api";

/**
 * Warms the browser HTTP cache for pages around the current one so paging
 * forward/back feels instant. This replaces the manual blob-URL LRU cache
 * the original in-browser-decoding version needed — here pages are just
 * static images the browser already knows how to cache.
 */
export function usePagePrefetch(comicId: string, currentPage: number, pageCount: number, radius = 2) {
  useEffect(() => {
    for (let offset = -radius; offset <= radius; offset++) {
      const index = currentPage + offset;
      if (index < 0 || index >= pageCount || offset === 0) continue;
      const img = new Image();
      img.src = api.pageUrl(comicId, index);
    }
  }, [comicId, currentPage, pageCount, radius]);
}
