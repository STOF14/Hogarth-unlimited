import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ComicDetail } from "../../types";
import { useUpdateProgress } from "../../hooks/useComics";
import { useUiStore } from "../../store/uiStore";
import { PagedView } from "./PagedView";
import { ScrollView } from "./ScrollView";

export function Reader({ comic }: { comic: ComicDetail }) {
  const navigate = useNavigate();
  const { readerMode, setReaderMode } = useUiStore();
  const updateProgress = useUpdateProgress(comic.id);

  const [currentPage, setCurrentPage] = useState(comic.progress?.currentPage ?? 0);

  // Persist progress, debounced — paged mode changes page-by-page, scroll
  // mode fires on every intersection change, so this avoids a network call
  // per pixel scrolled.
  useEffect(() => {
    const id = setTimeout(() => {
      const completed = currentPage >= comic.pageCount - 1;
      updateProgress.mutate({ currentPage, completed });
    }, 500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (readerMode !== "paged") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") setCurrentPage((p) => Math.min(p + 1, comic.pageCount - 1));
      if (e.key === "ArrowLeft") setCurrentPage((p) => Math.max(p - 1, 0));
      if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [readerMode, comic.pageCount, navigate]);

  return (
    <div className="flex h-full flex-col bg-void">
      <div className="flex items-center gap-4 border-b border-line px-4 py-2.5">
        <button onClick={() => navigate("/")} aria-label="Back to library" className="text-ink-dim hover:text-ink">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-5 w-5 stroke-current">
            <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="min-w-0 flex-1 truncate">
          <span className="truncate text-sm font-semibold text-ink">{comic.title}</span>
          {comic.number && <span className="ml-1.5 font-mono text-xs text-ink-faint">#{comic.number}</span>}
        </div>

        <span className="font-mono text-xs text-ink-faint">
          {currentPage + 1} / {comic.pageCount}
        </span>

        <div className="flex overflow-hidden rounded border border-line">
          <button
            onClick={() => setReaderMode("paged")}
            className={`px-2.5 py-1 text-[10px] uppercase tracking-wide ${
              readerMode === "paged" ? "bg-ink text-void" : "text-ink-faint"
            }`}
          >
            Paged
          </button>
          <button
            onClick={() => setReaderMode("scroll")}
            className={`px-2.5 py-1 text-[10px] uppercase tracking-wide ${
              readerMode === "scroll" ? "bg-ink text-void" : "text-ink-faint"
            }`}
          >
            Scroll
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {readerMode === "paged" ? (
          <PagedView
            comicId={comic.id}
            pageCount={comic.pageCount}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        ) : (
          <ScrollView
            comicId={comic.id}
            pageCount={comic.pageCount}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
